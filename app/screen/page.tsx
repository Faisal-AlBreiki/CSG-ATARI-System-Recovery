"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

type Progress = {
  fragment: number;
  count: number;
  complete: boolean;
};

const fragmentNames = ["IDENTITY CORE", "MEMORY CORE", "EVENT CORE"];
const fragmentKeys = ["CSG", "ATARI", "2026"];
type StagePhase =
  | "intro"
  | "intro-playing"
  | "intro-black"
  | "dashboard"
  | "verify"
  | "dashboard-fade"
  | "outro-black"
  | "outro"
  | "final-credit";

export default function Screen() {
  const [progress, setProgress] = useState<Progress[]>([
    { fragment: 1, count: 0, complete: false },
    { fragment: 2, count: 0, complete: false },
    { fragment: 3, count: 0, complete: false },
  ]);

  const [previous, setPrevious] = useState<Progress[]>([]);
  const [eventMessage, setEventMessage] = useState("RECOVERY PROTOCOL INITIATED");
  const [stagePhase, setStagePhase] = useState<StagePhase>("intro");

  const bgMusic = useRef<HTMLAudioElement | null>(null);
  const verifySound = useRef<HTMLAudioElement | null>(null);
  const introVideo = useRef<HTMLVideoElement | null>(null);
  const outroVideo = useRef<HTMLVideoElement | null>(null);
  const hasStartedAudio = useRef(false);
  const wasComplete = useRef(false);
  const hasLoadedProgress = useRef(false);
  const pendingVerify = useRef(false);
  const verifySequenceStarted = useRef(false);
  const fadeTimer = useRef<number | null>(null);

  const clearFadeTimer = () => {
    if (fadeTimer.current !== null) {
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
  };

  const fadeAudio = (audio: HTMLAudioElement, target: number, duration = 1800) => {
    const start = audio.volume;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progressValue = Math.min(1, (now - startedAt) / duration);
      audio.volume = start + (target - start) * progressValue;
      if (progressValue < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen can be unavailable in some embedded/browser contexts.
    }
  };

  const startStageExperience = async () => {
  if (stagePhase !== "intro") return;

  // IMPORTANT:
  // Unlock audio FIRST while the click is still an active user gesture.
  hasStartedAudio.current = true;

  // Start background music silently during the user's click.
  // It will fade in when the dashboard appears.
  if (bgMusic.current) {
    bgMusic.current.volume = 0;
    bgMusic.current.currentTime = 0;

    bgMusic.current.play().catch(() => {
      // Retry shortly if the browser was still preparing the media.
      window.setTimeout(() => {
        bgMusic.current?.play().catch(() => undefined);
      }, 250);
    });
  }

  // Prime the verification sound during the same user gesture.
  // It is played almost silently, then paused at the beginning.
  // This gives the browser permission to play it later.
  if (verifySound.current) {
    const sound = verifySound.current;

    sound.currentTime = 0;
    sound.volume = 0.001;

    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = 0.85;
      pendingVerify.current = false;
    }).catch(() => {
      sound.volume = 0.85;
      pendingVerify.current = true;
    });
  } else {
    pendingVerify.current = true;
  }

  // Prime the second video.
  if (outroVideo.current) {
    outroVideo.current.muted = true;
    outroVideo.current.currentTime = 0;

    outroVideo.current.play().then(() => {
      outroVideo.current?.pause();

      if (outroVideo.current) {
        outroVideo.current.currentTime = 0;
        outroVideo.current.muted = false;
      }
    }).catch(() => undefined);
  }

  // Request fullscreen AFTER unlocking the audio.
  await enterFullscreen();

  setStagePhase("intro-playing");

  // Start Part 1.
  if (introVideo.current) {
    introVideo.current.currentTime = 0;

    try {
      await introVideo.current.play();
    } catch {
      // The user can click again if a browser blocks video playback.
    }
  }
};

  const handleIntroEnded = () => {
    setStagePhase("intro-black");
    fadeTimer.current = window.setTimeout(() => {
      setStagePhase("dashboard");
      if (bgMusic.current) fadeAudio(bgMusic.current, 0.25, 2200);
    }, 5000);
  };

  const startFinalSequence = () => {
    if (verifySequenceStarted.current) return;
    verifySequenceStarted.current = true;
    setStagePhase("verify");

    if (bgMusic.current) {
      fadeAudio(bgMusic.current, 0, 700);
      window.setTimeout(() => {
        if (bgMusic.current) {
          bgMusic.current.pause();
          bgMusic.current.currentTime = 0;
        }
      }, 750);
    }

    if (verifySound.current) {
      const sound = verifySound.current;

      sound.currentTime = 0;
      sound.volume = 0.85;

      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          pendingVerify.current = true;

          // Retry a few times in case the browser is still
          // finishing media preparation.
          let attempts = 0;

          const retryVerify = () => {
            if (!verifySound.current) return;

            attempts += 1;

            verifySound.current.currentTime = 0;
            verifySound.current.volume = 0.85;

            verifySound.current.play().catch(() => {
              if (attempts < 5) {
                window.setTimeout(retryVerify, 250);
              }
            });
          };

          window.setTimeout(retryVerify, 150);
        });
      }
    } else {
      pendingVerify.current = true;
    }

    fadeTimer.current = window.setTimeout(() => {
      setStagePhase("dashboard-fade");
      fadeTimer.current = window.setTimeout(() => {
        setStagePhase("outro-black");
        fadeTimer.current = window.setTimeout(() => {
          setStagePhase("outro");
        }, 5000);
      }, 5000);
    }, 5000);
  };

  async function refresh() {
    // Once the live experience has moved to the outro, the database no longer
    // needs to drive the stage visuals.
    if (stagePhase === "outro" || stagePhase === "outro-black") return;

    const { data } = await supabase.rpc("get_progress");
    if (data) {
      setPrevious(progress);
      setProgress(data);

      const unlocked = data.find(
        (item: Progress, index: number) =>
          item.complete && !previous[index]?.complete
      );

      if (unlocked) {
        setEventMessage(`FRAGMENT 0${unlocked.fragment} UNLOCKED`);
        setTimeout(() => setEventMessage("RECOVERY PROTOCOL ACTIVE"), 4000);
      }

      const nowComplete = data.every((item: Progress) => item.complete);

      // Reset the completion trigger whenever the database is no longer complete.
      // This allows the full experience to be tested/replayed again.
      if (!nowComplete) {
        wasComplete.current = false;
        verifySequenceStarted.current = false;
      }

      // Start the final sequence only when:
      // 1. All 3 fragments are complete
      // 2. We are currently showing the dashboard
      // 3. The sequence has not already started
      else if (
        stagePhase === "dashboard" &&
        !wasComplete.current &&
        !verifySequenceStarted.current
      ) {
        wasComplete.current = true;
        startFinalSequence();
      }
    }
  }

  useEffect(() => {
    const startAudioFallback = () => {
      hasStartedAudio.current = true;
      if (pendingVerify.current && verifySound.current) {
        pendingVerify.current = false;
        verifySound.current.currentTime = 0;
        verifySound.current.play().catch(() => {
          pendingVerify.current = true;
        });
      }
    };

    window.addEventListener("click", startAudioFallback);
    window.addEventListener("keydown", startAudioFallback);

    return () => {
      window.removeEventListener("click", startAudioFallback);
      window.removeEventListener("keydown", startAudioFallback);
    };
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => {
      clearInterval(timer);
    };
    // The live polling intentionally runs independently of React progress state.
    // Do not clear stage transition timers here: this effect reruns whenever
    // stagePhase changes, and clearing the timer would cancel the 5s blackout
    // immediately after the intro video (and the later 10s/5s/5s sequence).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagePhase]);

  // Stage transition timers should only be cancelled if the whole screen
  // component unmounts, not when the phase changes.
  useEffect(() => {
    return () => {
      clearFadeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stagePhase === "outro" && outroVideo.current) {
      outroVideo.current.currentTime = 0;
      outroVideo.current.play().catch(() => undefined);
    }
  }, [stagePhase]);

  const total = progress.reduce((sum, p) => sum + Math.min(p.count, 10), 0);
  const percent = Math.round((total / 30) * 100);
  const complete = progress.every((p) => p.complete);

  const dashboardVisible = stagePhase === "dashboard" || stagePhase === "verify" || stagePhase === "dashboard-fade";

  return (
    <main className={`stage-shell phase-${stagePhase}`}>
      <audio ref={bgMusic} src="/audio/atari-background.mp3" loop preload="auto" />
      <audio ref={verifySound} src="/audio/system-verify.mp3" preload="auto" />

      <video
        ref={introVideo}
        className="stage-video stage-video-intro"
        src="/video/part1.mp4"
        playsInline
        preload="auto"
        onEnded={handleIntroEnded}
        aria-hidden="true"
      />

      <video
        ref={outroVideo}
        className="stage-video stage-video-outro"
        src="/video/part2.mp4"
        playsInline
        preload="auto"
        onEnded={() => {
          setStagePhase("outro-black");

          window.setTimeout(() => {
            setStagePhase("final-credit");
          }, 1000);
        }}
        aria-hidden="true"
      />

      {stagePhase === "intro" && (
        <button className="stage-start" onClick={startStageExperience} aria-label="Start ATARI stage experience">
          <span>CLICK TO INITIALIZE SYSTEM</span>
        </button>
      )}

      {stagePhase === "final-credit" && (
        <div className="final-credit">
          <div className="final-status">
            SYSTEM ONLINE
          </div>

          <div className="final-line">
            DESIGNED & DEVELOPED BY
          </div>

          <div className="final-names">
            Faisal Al Breiki<br />
            Juhaina Al Subhi
          </div>

          <div className="final-brand">
            CSG // ATARI / 2026
          </div>
        </div>
      )}

      {dashboardVisible && (
        <div className={`dashboard-layer ${stagePhase === "dashboard-fade" ? "dashboard-fading" : ""}`}>
          <main className={`screen ${complete ? "restored" : "failure"}`}>
            <div className="crt" />
            <div className="stars" />
            <div className="glitch-layer" />

            <header className="screen-header">
              <div className="brand">CSG // ATARI SYSTEM RECOVERY</div>
              <div className="status">
                ● {complete ? "SYSTEM ONLINE" : "SYSTEM FAILURE"}
              </div>
            </header>

            <section className="hero hero-layout">
              <div className="hero-copy">
                <div className="kicker">ATARI // RECOVERY PROTOCOL</div>
                <h1>
                  <span className="hero-primary">SYSTEM</span>{" "}
                  <span>{complete ? "RESTORED" : "FAILURE"}</span>
                </h1>
                <p className="message-line">{eventMessage}</p>
              </div>

              <div className="hero-art" aria-hidden="true">
                <img src="/crab-transparent.png" alt="" className="hero-crab" />
              </div>
            </section>

            {!complete && (
              <div className="mission">
                3 FRAGMENTS REQUIRED // AWAITING OPERATORS
              </div>
            )}

            <section className="global-progress">
              <div>
                <span>GLOBAL RECOVERY</span>
                <strong>{percent}%</strong>
              </div>
              <div className="meter">
                <div style={{ width: `${percent}%` }} />
              </div>
            </section>

            {!complete && (
              <section className="fragments-screen">
                {progress.map((p) => {
                  const fragmentPercent = Math.round((Math.min(p.count, 10) / 10) * 100);
                  return (
                    <article
                      key={p.fragment}
                      className={`fragment-node ${p.complete ? "recovered" : "locked"}`}
                    >
                      <div className="node-title">FRAGMENT 0{p.fragment}</div>
                      <div className="node-core">
                        {p.complete ? (
                          <>
                            <div className="unlock">UNLOCKED</div>
                            <div className="key">{fragmentKeys[p.fragment - 1]}</div>
                          </>
                        ) : (
                          <>
                            <div className="percent-big">{fragmentPercent}%</div>
                            <div className="loading">RECOVERY IN PROGRESS</div>
                          </>
                        )}
                      </div>
                      <div className="node-footer">{fragmentNames[p.fragment - 1]}</div>
                    </article>
                  );
                })}
              </section>
            )}

            {complete && (
              <section className="final-sequence">
                <div>ALL FRAGMENTS RECOVERED</div>
                <div className="verify">VERIFYING SYSTEM...</div>
                <strong>CSG - ATARI - 2026</strong>
              </section>
            )}
          </main>
        </div>
      )}

      {stagePhase === "outro-black" && <div className="stage-black stage-black-outro" />}
    </main>
  );
}
