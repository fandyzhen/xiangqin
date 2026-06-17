"use client";

import { useMemo, useState } from "react";
import { APP_NAME } from "@/lib/brand";
import type { HongniangLead } from "@/lib/hongniang";

type LeadsResponse = {
  ok: boolean;
  total: number;
  unread: number;
  leads: HongniangLead[];
  message?: string;
};

function formatTime(value?: string) {
  if (!value) {
    return "未知时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function idealSummary(lead: HongniangLead) {
  return [
    lead.idealType.appearanceVibe,
    lead.idealType.hairstyle,
    lead.idealType.bodyType,
    lead.idealType.companionStyle,
    lead.idealType.lifestyle,
    lead.idealType.relationshipMode
  ].filter(Boolean);
}

function girlSummary(lead: HongniangLead) {
  const girl = lead.intendedGirl ?? lead.matchedGirl;
  return `${girl.nickname} · ${girl.residence} · ${girl.profession} · ${girl.height}cm/${girl.weight}kg`;
}

export default function HongniangPage() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<HongniangLead[]>([]);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const unreadCount = useMemo(() => leads.filter((lead) => !lead.read).length, [leads]);

  async function loadLeads(nextPassword = password) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/hongniang/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nextPassword })
      });
      const data = (await response.json()) as LeadsResponse;

      if (!response.ok) {
        throw new Error(data.message || "读取失败");
      }

      setAuthorized(true);
      setLeads(data.leads);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRead(lead: HongniangLead) {
    setMessage("");
    const nextRead = !lead.read;
    setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, read: nextRead } : item)));

    try {
      const response = await fetch("/api/hongniang/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id: lead.id, read: nextRead })
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "标记失败");
      }
    } catch (error) {
      setLeads((current) => current.map((item) => (item.id === lead.id ? { ...item, read: lead.read } : item)));
      setMessage(error instanceof Error ? error.message : "标记失败");
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-board">
        <header className="admin-header">
          <span>DAZHANGQIU MATCHMAKER</span>
          <h1>红娘线索台</h1>
          <p>{APP_NAME} 用户留资资料，只给内部红娘查看。</p>
        </header>

        {!authorized ? (
          <form
            className="admin-login"
            onSubmit={(event) => {
              event.preventDefault();
              loadLeads();
            }}
          >
            <label>
              输入红娘查看密码
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" type="password" />
            </label>
            {message && <p className="admin-message">{message}</p>}
            <button className="primary-cta" type="submit" disabled={loading}>
              {loading ? "验证中" : "进入线索台"}
            </button>
          </form>
        ) : (
          <>
            <div className="admin-stats">
              <div>
                <span>全部线索</span>
                <strong>{leads.length}</strong>
              </div>
              <div>
                <span>未读</span>
                <strong>{unreadCount}</strong>
              </div>
              <button className="secondary-cta subtle-cta" type="button" disabled={loading} onClick={() => loadLeads()}>
                刷新
              </button>
            </div>

            {message && <p className="admin-message">{message}</p>}

            <div className="lead-admin-list">
              {leads.length === 0 && <p className="admin-empty">暂时还没有用户留资。</p>}
              {leads.map((lead) => (
                <article className={`lead-admin-item ${lead.read ? "is-read" : ""}`} key={lead.id}>
                  <div className="lead-admin-top">
                    <div>
                      <span className="lead-source">{lead.leadSource}</span>
                      <h2>
                        {lead.contact.name}
                        <small>{lead.contact.phone}</small>
                      </h2>
                    </div>
                    <button className="read-toggle" type="button" onClick={() => toggleRead(lead)}>
                      {lead.read ? "标为未读" : "标记已读"}
                    </button>
                  </div>

                  <div className="lead-admin-meta">
                    <span>{formatTime(lead.createdAt)}</span>
                    <span>{lead.quizScore} 分</span>
                    <span>{lead.personalityTag}</span>
                  </div>

                  <section className="lead-admin-section">
                    <strong>他的理想型</strong>
                    <div className="admin-tags">
                      {idealSummary(lead).map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </section>

                  <section className="lead-admin-section">
                    <strong>{lead.intendedGirl ? "想认识的女生" : "参考匹配画像"}</strong>
                    <p>{girlSummary(lead)}</p>
                    <small>
                      契合度 {lead.matchedGirl.matchPercent}% · {lead.matchedGirl.matchGap}
                    </small>
                  </section>

                  <details className="lead-admin-detail">
                    <summary>展开完整资料</summary>
                    <dl>
                      <div>
                        <dt>女生性格</dt>
                        <dd>{lead.matchedGirl.personality}</dd>
                      </div>
                      <div>
                        <dt>女生爱好</dt>
                        <dd>{lead.matchedGirl.hobbies.join("、")}</dd>
                      </div>
                      <div>
                        <dt>理想型图片</dt>
                        <dd>{lead.idealImageUrl}</dd>
                      </div>
                      <div>
                        <dt>图片 seed</dt>
                        <dd>{lead.idealImageSeed}</dd>
                      </div>
                    </dl>
                  </details>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
