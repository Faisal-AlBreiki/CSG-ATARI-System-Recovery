"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const fragments = [
  { id: 1, name: "IDENTITY CORE" },
  { id: 2, name: "MEMORY CORE" },
  { id: 3, name: "EVENT CORE" }
];

function getParticipantId() {
  const key = "atari_participant_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [fragment, setFragment] = useState(1);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getParticipantId();
  }, []);

  async function submit() {
    if (!answer.trim() || busy) return;
    setBusy(true);
    setMessage("");
    setOk(false);

    const participantId = getParticipantId();

    const { data, error } = await supabase.rpc("submit_answer", {
      p_fragment: fragment,
      p_answer: answer.trim(),
      p_participant_id: participantId
    });

    if (error) {
      setMessage("SYSTEM CONNECTION ERROR — حاول مرة أخرى.");
      setBusy(false);
      return;
    }

    if (data?.correct) {
      setOk(true);
      setMessage(`✓ VERIFIED — Fragment ${fragment} accepted. ${data.count}/10 operators registered.`);
      setAnswer("");

    } else {
      setMessage("✕ ACCESS DENIED — الإجابة غير صحيحة.");
    }

    setBusy(false);
  }

  return (
    <>
    <main className="center page">
      <section className="panel">
        <div className="panel-inner">
          <div className="kicker">ATARI // RECOVERY PROTOCOL</div>
          <div className="title">SYSTEM<br />RECOVERY</div>
          <p className="subtitle">
            A system failure has occurred. Select the recovery fragment assigned
            to your puzzle, then enter the key you recovered.
          </p>

          <div style={{ marginTop: 28 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>SELECT FRAGMENT</div>
            <div className="grid">
              {fragments.map((f) => (
                <button
                  key={f.id}
                  className={`fragment ${fragment === f.id ? "selected" : ""}`}
                  onClick={() => setFragment(f.id)}
                >
                  <span className="num">FRAGMENT 0{f.id}</span>
                  <span className="name">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>RECOVERY KEY</div>
            <input
              className="input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="ENTER YOUR SOLUTION"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            <button className="primary" disabled={busy || !answer.trim()} onClick={submit}>
              {busy ? "VERIFYING..." : "VERIFY KEY"}
            </button>
          </div>

          {message && (
            <div className={`message ${ok ? "ok" : "error"}`}>
              {message}
            </div>
          )}

          <div className="scan-note">
            OPERATOR ID is generated automatically on this device.<br />
            Your device can contribute once to each fragment.
          </div>
        </div>
      </section>
    </main>
    </>
  );
}