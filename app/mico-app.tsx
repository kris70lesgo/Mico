import {
  useEffect,
  useState,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock3,
  Flame,
  Heart,
  Home,
  LibraryBig,
  LockKeyhole,
  Medal,
  MoreHorizontal,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { allLessons, units, type Lesson } from "./mico-data";
import { isActivityCorrect, type ActivityAnswer } from "./mico-lesson-types";
import MicoActivityPlayer from "./mico-activity-player";
import {
  initialProgress,
  levelFor,
  loadProgress,
  saveProgress,
  type MicoProgress,
} from "./mico-progress";
import {
  applyLearningResult,
  loadCloudProgress,
  purchaseShopItem,
  recordLearningResult,
  startUnlimitedHeartsCheckout,
} from "./mico-sync";
import "./mico.css";
import "./mico-duolingo.css";
import "./mico-sections.css";
import "./mico-pages.css";
import "./mico-league.css";
import "./mico-light.css";
import "./mico-light-fix.css";
import "./mico-buttons.css";
import "./mico-mascot-variants.css";
import "./mico-path-polish.css";
import "./mico-companion.css";
import "./mico-companion-fix.css";
import "./mico-popup.css";
import "./mico-lesson-options.css";
import "./mico-lesson-chrome.css";
import "./mico-activity-player.css";
import "./mico-profile.css";
import "./mico-practice-hub.css";
import "./mico-shop.css";
import "./mico-learning-loop.css";
import "./mico-mobile.css";
import { playMicoSound } from "./mico-sound";

type View =
  | "learn"
  | "practice"
  | "leaderboard"
  | "quests"
  | "shop"
  | "profile"
  | "lesson";
type PageView = Exclude<View, "lesson">;
export type MicoLearner = {
  id: string;
  name: string;
  email?: string;
  demo?: boolean;
  onSignOut: () => void;
};
export default function MicoApp({
  onExplore,
  learner,
}: {
  onExplore: (concept?: string) => void;
  learner: MicoLearner;
}) {
  const [view, setView] = useState<View>("learn");
  const [lessonReturnView, setLessonReturnView] = useState<PageView>("learn");
  const [progress, setProgress] = useState<MicoProgress>(initialProgress);
  const [lesson, setLesson] = useState<Lesson>(allLessons[0]);
  const [statusPanel, setStatusPanel] = useState<
    "streak" | "xp" | "hearts" | null
  >(null);
  const [hydrated, setHydrated] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(
    () =>
      typeof window === "undefined" ||
      localStorage.getItem("mico-sound") !== "off",
  );
  useEffect(
    () => localStorage.setItem("mico-sound", soundEnabled ? "on" : "off"),
    [soundEnabled],
  );
  useEffect(() => {
    let alive = true;
    setHydrated(false);
    const local = loadProgress();
    if (learner.demo) {
      if (alive) {
        setProgress(local);
        setHydrated(true);
      }
      return () => {
        alive = false;
      };
    }
    loadCloudProgress(learner.id)
      .then((remote) => {
        if (alive) setProgress(remote ?? local);
      })
      .catch(() => {
        if (alive) setProgress(local);
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, [learner.id, learner.demo]);
  useEffect(() => {
    if (hydrated) saveProgress(progress);
  }, [progress, hydrated]);
  const go = (next: PageView) => {
    setView(next);
    window.history.pushState({ micoView: next }, "", window.location.href);
  };
  const start = (
    next: Lesson,
    origin: PageView = view === "lesson" ? "learn" : view,
  ) => {
    setLesson(next);
    setLessonReturnView(origin);
    setView("lesson");
    window.history.pushState(
      { micoView: "lesson", returnView: origin },
      "",
      window.location.href,
    );
  };
  const exitLesson = () => {
    setView(lessonReturnView);
    if (window.history.state?.micoView === "lesson") window.history.back();
    else
      window.history.pushState(
        { micoView: lessonReturnView },
        "",
        window.location.href,
      );
  };
  useEffect(() => {
    const onPopState = () => {
      const saved = window.history.state?.micoView as View | undefined;
      if (saved === "lesson") {
        setLessonReturnView(
          (window.history.state?.returnView as PageView | undefined) ?? "learn",
        );
        setView("lesson");
      } else setView(saved ?? "learn");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const nav = [
    ["learn", "Learn", Home],
    ["practice", "Practice", RotateCcw],
    ["leaderboard", "Leaderboard", Medal],
    ["quests", "Quests", Target],
    ["shop", "Shop", ShoppingBag],
    ["profile", "Profile", UserRound],
  ] as const;
  return (
    <main className="mico-shell">
      <aside className="mico-side">
        <button className="mico-brand" onClick={() => go("learn")}>
          <span className="mico-orb">m</span>
          <span>Mico</span>
        </button>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
          <button onClick={() => onExplore()}>
            <LibraryBig size={20} />
            Study sets
          </button>
          <button onClick={() => go("practice")}>
            <MoreHorizontal size={20} />
            More
          </button>
        </nav>
        <div className="mico-profile">
          <button className="mico-profile-main" onClick={() => go("profile")}>
            <span className="mico-avatar">
              {learner.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <b>{learner.name}</b>
              <small>
                {learner.demo
                  ? "Limited public demo"
                  : "Synced to your account"}
              </small>
            </span>
          </button>
          <button
            className="mico-signout"
            onClick={learner.onSignOut}
            aria-label="Sign out"
          >
            ↪
          </button>
        </div>
      </aside>
      <div className="mico-mobile">
        <button className="mico-brand" onClick={() => go("learn")}>
          <span className="mico-orb">m</span>
          <span>Mico</span>
        </button>
        <button onClick={() => onExplore()}>
          <LibraryBig size={20} />
          Explore
        </button>
      </div>
      <section className="mico-main">
        <header className="mico-top">
          <div>
            <span className="mico-kicker">YOUR ANATOMY LAB</span>
            <h1>
              {view === "learn"
                ? "Learn by seeing it."
                : view === "lesson"
                  ? (allLessons.find((item) => item.id === lesson.id)?.unit
                      .title ?? "Lesson")
                  : view === "practice"
                    ? "Practice lab"
                    : view === "quests"
                      ? "Challenges"
                      : view === "profile"
                        ? "Your profile"
                        : view === "shop"
                          ? "Study shop"
                          : "Weekly standings"}
            </h1>
          </div>
          <div className="mico-stats">
            <button
              className="mico-sound-toggle"
              onClick={() => setSoundEnabled((value) => !value)}
              aria-label={
                soundEnabled ? "Mute sound effects" : "Enable sound effects"
              }
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <StatusCounter
              active={statusPanel === "streak"}
              image="/mico/status/streak-flame.png"
              label="Study streak"
              value={progress.streak}
              detail="days in a row"
              onClick={() =>
                setStatusPanel(statusPanel === "streak" ? null : "streak")
              }
            />
            <StatusCounter
              active={statusPanel === "xp"}
              image="/mico/status/study-gem.png"
              label="Study gems"
              value={progress.xp}
              detail="earned from lessons"
              onClick={() => setStatusPanel(statusPanel === "xp" ? null : "xp")}
            />
            <StatusCounter
              active={statusPanel === "hearts"}
              image="/mico/status/heart-life.png"
              label="Hearts"
              value={learner.demo ? "∞" : progress.hearts}
              detail={
                learner.demo ? "unlimited in this demo" : "ready for practice"
              }
              onClick={() =>
                setStatusPanel(statusPanel === "hearts" ? null : "hearts")
              }
            />
          </div>
        </header>
        {view === "learn" && (
          <Learn progress={progress} start={start} onExplore={onExplore} />
        )}{" "}
        {view === "practice" && <Practice progress={progress} start={start} />}{" "}
        {view === "leaderboard" && <Leaderboard progress={progress} />}{" "}
        {view === "quests" && <Quests progress={progress} start={start} />}{" "}
        {view === "shop" && (
          <Shop
            progress={progress}
            setProgress={setProgress}
            learner={learner}
          />
        )}{" "}
        {view === "profile" && (
          <Profile progress={progress} learner={learner} />
        )}{" "}
        {view === "lesson" && (
          <LessonPlayer
            lesson={lesson}
            progress={progress}
            setProgress={setProgress}
            onExit={exitLesson}
            onExplore={onExplore}
            learner={learner}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((value) => !value)}
          />
        )}
      </section>
      <nav className="mico-mobile-nav" aria-label="Mobile navigation">
        {(
          [
            ["learn", "Learn", Home],
            ["practice", "Practice", RotateCcw],
            ["shop", "Shop", ShoppingBag],
            ["profile", "Profile", UserRound],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => go(id)}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

function StatusCounter({
  active,
  image,
  label,
  value,
  detail,
  onClick,
}: {
  active: boolean;
  image: string;
  label: string;
  value: number | string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <div className={`mico-status-counter ${active ? "open" : ""}`}>
      <button type="button" aria-expanded={active} onClick={onClick}>
        <img src={image} alt="" />
        <b>{value}</b>
      </button>
      <div role="status">
        <strong>{label}</strong>
        <span>
          {value} {detail}
        </span>
      </div>
    </div>
  );
}

function Learn({
  progress,
  start,
  onExplore,
}: {
  progress: MicoProgress;
  start: (lesson: Lesson) => void;
  onExplore: (concept?: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<Lesson | null>(null);
  const next =
    allLessons.find((x) => !progress.completed.includes(x.id)) ?? allLessons[0];
  const nextUnit = next.unit;
  if (selected) {
    const unit = units.find((item) => item.id === selected) ?? units[0];
    const pendingIndex = pending
      ? unit.lessons.findIndex((item) => item.id === pending.id)
      : 0;
    const done = unit.lessons.filter((item) =>
      progress.completed.includes(item.id),
    ).length;
    return (
      <div className="mico-layout">
        <div className="mico-path mico-unit-detail">
          <button
            className="mico-back"
            onClick={() => {
              setPending(null);
              setSelected(null);
            }}
          >
            ← All sections
          </button>
          <section className="mico-expedition-strip">
            <i>{unit.lessons[0]?.icon ?? "✦"}</i>
            <div>
              <span>
                Anatomy expedition · {done}/{unit.lessons.length} complete
              </span>
              <b>
                {done === unit.lessons.length
                  ? "Unit complete — review or move forward."
                  : `Next up: ${nextUnit.id === unit.id ? next.title : unit.lessons[Math.min(done, unit.lessons.length - 1)].title}`}
              </b>
            </div>
            <button
              onClick={() =>
                setPending(
                  nextUnit.id === unit.id
                    ? next
                    : unit.lessons[Math.min(done, unit.lessons.length - 1)],
                )
              }
            >
              Resume
            </button>
          </section>
          <section className="mico-hero">
            <div>
              <span className="mico-pill">
                SECTION {units.findIndex((item) => item.id === unit.id) + 1} ·{" "}
                {unit.lessons.length} LESSONS
              </span>
              <h2>{unit.title}</h2>
              <button
                className="mico-primary"
                onClick={() =>
                  setPending(nextUnit.id === unit.id ? next : unit.lessons[0])
                }
              >
                <Play size={18} fill="currentColor" />
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </section>
          <div className="mico-section-title">
            <div>
              <h2>{unit.description}</h2>
            </div>
          </div>
          <section
            className="mico-unit"
            style={{ "--unit": unit.color } as CSSProperties}
          >
            <div
              className={`mico-nodes ${pending ? "has-preview" : ""}`}
              style={
                {
                  "--preview-top": `${pendingIndex * 140 + 142}px`,
                } as CSSProperties
              }
            >
              {unit.lessons.map((item, index) => {
                const complete = progress.completed.includes(item.id);
                const available =
                  complete ||
                  index === 0 ||
                  progress.completed.includes(unit.lessons[index - 1]?.id);
                return (
                  <button
                    key={item.id}
                    disabled={!available}
                    aria-label={item.title}
                    className={`mico-node ${complete ? "complete" : ""} ${item.id === next.id ? "current" : ""} ${item.id === pending?.id ? "previewing" : ""}`}
                    onClick={() => setPending(item)}
                  >
                    <i>
                      {complete ? (
                        "✓"
                      ) : available ? (
                        item.icon
                      ) : (
                        <LockKeyhole size={19} />
                      )}
                    </i>
                    <span>
                      <b>{item.title}</b>
                      <small>{item.subtitle}</small>
                    </span>
                  </button>
                );
              })}
              {pending && (
                <div
                  className="mico-node-popup"
                  role="dialog"
                  aria-label={`${pending.title} lesson`}
                >
                  <button
                    className="mico-popup-close"
                    aria-label="Close lesson preview"
                    onClick={() => setPending(null)}
                  >
                    ×
                  </button>
                  <span>ANATOMY LESSON</span>
                  <h3>{pending.title}</h3>
                  <p>
                    Lesson {pendingIndex + 1} of {unit.lessons.length} ·{" "}
                    {pending.subtitle}
                  </p>
                  <button onClick={() => start(pending)}>
                    <Play size={17} fill="currentColor" />
                    Start +10 XP
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
        <LearningRail
          progress={progress}
          start={start}
          next={next}
          onExplore={onExplore}
        />
      </div>
    );
  }
  return (
    <div className="mico-layout">
      <div className="mico-sections">
        <section className="mico-expedition-strip">
          <i>✦</i>
          <div>
            <span>Your anatomy expedition</span>
            <b>
              Next: {next.title} · {next.unit.title}
            </b>
          </div>
          <button onClick={() => start(next)}>Start lesson</button>
        </section>
        <div className="mico-sections-rule" />
        {units.map((unit, index) => {
          const isOpen =
            index < 2 ||
            progress.completed.some((id) =>
              unit.lessons.some((lesson) => lesson.id === id),
            );
          const completed = unit.lessons.filter((item) =>
            progress.completed.includes(item.id),
          ).length;
          const percentage = Math.round(
            (completed / unit.lessons.length) * 100,
          );
          return (
            <section
              className={`mico-section-card ${isOpen ? "open" : "locked"}`}
              key={unit.id}
            >
              <div>
                <span>
                  SECTION {index + 1} ·{" "}
                  <button onClick={() => setSelected(unit.id)}>
                    SEE DETAILS
                  </button>
                </span>
                <h2>{unit.title}</h2>
                <p>
                  {isOpen
                    ? `${unit.lessons.length} lessons · ${unit.description}`
                    : "Locked · complete the previous section to continue."}
                </p>
                {isOpen && (
                  <div className="mico-section-progress">
                    <i style={{ width: `${percentage}%` }} />
                    <b>{percentage}%</b>
                  </div>
                )}
                <button
                  className="mico-section-cta"
                  disabled={!isOpen}
                  onClick={() => isOpen && setSelected(unit.id)}
                >
                  {completed === unit.lessons.length
                    ? "Review unit"
                    : isOpen
                      ? "Continue"
                      : "Locked"}{" "}
                  <ChevronRight size={17} />
                </button>
              </div>
              <img
                src="/mico/mascots/mico-welcome.png"
                alt="Mico welcomes you"
              />
            </section>
          );
        })}
      </div>
      <LearningRail
        progress={progress}
        start={start}
        next={next}
        onExplore={onExplore}
      />
    </div>
  );
}

function LearningRail({
  progress,
  start,
  next,
  onExplore,
}: {
  progress: MicoProgress;
  start: (lesson: Lesson) => void;
  next: Lesson;
  onExplore: (concept?: string) => void;
}) {
  return (
    <aside className="mico-rail">
      <section className="mico-card mico-plus">
        <img src="/mico/mascots/mico-celebrate.png" alt="Mico celebrates" />
        <span>MICO PLUS</span>
        <h3>Learn anatomy with no limits.</h3>
        <p>Keep your streak, train weak spots, and unlock focused review.</p>
        <button onClick={() => start(next)}>Try 7 days free</button>
      </section>
      <Daily progress={progress} start={start} />
      <section className="mico-card mico-weak">
        <div className="mico-card-title">
          <Target size={18} />
          <b>Review queue</b>
        </div>
        <p>These concepts need a little extra attention.</p>
        {progress.weak.map((name, i) => (
          <div className="mico-weak-row" key={name}>
            <span>{name}</span>
            <i style={{ width: `${72 - i * 15}%` }} />
          </div>
        ))}
        <button onClick={() => onExplore()}>
          Explore in 3D <ChevronRight size={15} />
        </button>
      </section>
      <section className="mico-card mico-atlas-card">
        <span>3D ATLAS</span>
        <h3>Study any structure from every angle.</h3>
        <button onClick={() => onExplore()}>
          Open Atlas <LibraryBig size={17} />
        </button>
      </section>
    </aside>
  );
}

function Daily({
  progress,
  start,
}: {
  progress: MicoProgress;
  start: (lesson: Lesson) => void;
}) {
  const dailyXp = Math.min(50, progress.dailyXp);
  const challenges = [
    ["Brain sprint", "Locate key balance and movement structures.", "brain-1"],
    ["Bone builder", "Read load-bearing landmarks in 3D.", "skeletal-1"],
    ["Muscle motion", "Match upper-arm structures to actions.", "muscle-1"],
    ["Breathing lab", "Trace airways from trachea to lungs.", "resp-1"],
    [
      "Heart sprint",
      "Follow pressure and flow through the chambers.",
      "heart-chambers",
    ],
  ] as const;
  const day = Math.floor(Date.now() / 86400000);
  const [title, description, lessonId] = challenges[day % challenges.length];
  const dailyLesson =
    allLessons.find((item) => item.id === lessonId) ?? allLessons[0];
  return (
    <section className="mico-card mico-daily">
      <div className="mico-card-title">
        <span className="mico-sun">✺</span>
        <b>Daily challenge</b>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="mico-goal">
        <i style={{ width: `${(dailyXp / 50) * 100}%` }} />
        <span>{dailyXp}/50 XP</span>
      </div>
      <button className="mico-outline" onClick={() => start(dailyLesson)}>
        <Clock3 size={16} />
        Start challenge
      </button>
    </section>
  );
}

function Quests({
  progress,
  start,
}: {
  progress: MicoProgress;
  start: (lesson: Lesson) => void;
}) {
  const goals = [
    [
      "⚡",
      "Earn 50 XP",
      `${progress.dailyXp}/50`,
      Math.min(100, progress.dailyXp * 2),
    ],
    ["◎", "Score 90% in one lesson", "0/1", 0],
    ["◴", "Study for 10 minutes", "4/10", 40],
  ];
  return (
    <div className="mico-page-layout">
      <div>
        <section className="mico-monthly">
          <span>SEPTEMBER</span>
          <h2>Anatomy Quest</h2>
          <p>17 days left</p>
          <div>
            <b>Complete 15 quests</b>
            <i>
              <em style={{ width: "20%" }} />
            </i>
            <small>3 / 15</small>
          </div>
        </section>
        <h2 className="mico-page-title">
          Daily Quests <span>↻ 13 hours</span>
        </h2>
        <section className="mico-goal-list">
          {goals.map(([icon, title, value, width]) => (
            <button key={title} onClick={() => start(allLessons[0])}>
              <b>{icon}</b>
              <div>
                <strong>{title}</strong>
                <i>
                  <em style={{ width: `${width}%` }} />
                </i>
                <small>{value}</small>
              </div>
              <span>▣</span>
            </button>
          ))}
        </section>
      </div>
      <aside className="mico-rail">
        <section className="mico-card mico-badge-card">
          <span>MONTHLY BADGE</span>
          <h3>Earn your first badge!</h3>
          <p>
            Complete each month’s challenge to build your anatomy badge
            collection.
          </p>
          <div>✦</div>
        </section>
      </aside>
    </div>
  );
}

function Profile({
  progress,
  learner,
}: {
  progress: MicoProgress;
  learner: MicoLearner;
}) {
  const [tab, setTab] = useState<"circle" | "activity">("circle");
  const stats = [
    ["🔥", String(progress.streak), "Day streak", "#ff9a4a"],
    ["✦", String(progress.xp), "Total XP", "#29aaf0"],
    ["◈", "Bronze", "Current league", "#d79858"],
    ["◎", "0", "Top 3 finishes", "#a58de7"],
  ];
  const achievements = [
    [
      "First steps",
      "Finish an anatomy lesson",
      Math.min(1, progress.completed.length),
      1,
      "#55c7f2",
    ],
    [
      "Heart scout",
      "Master 3 heart activities",
      Math.min(3, Math.round((progress.mastery.Heart ?? 0) / 34)),
      3,
      "#f47f76",
    ],
    ["Steady learner", "Build a 7 day streak", progress.streak, 7, "#ffcb3d"],
  ];
  return (
    <div className="mico-profile-page">
      <main>
        <section className="mico-profile-hero">
          <div className="mico-profile-hero-copy">
            <span className="mico-profile-eyebrow">MICO LEARNER PROFILE</span>
            <div className="mico-profile-avatar">
              {learner.name.slice(0, 1).toUpperCase()}
              <i>✦</i>
            </div>
            <div>
              <h2>{learner.name}</h2>
              <p>
                {learner.demo
                  ? "Limited public demo · progress is temporary"
                  : `${learner.email ?? "Mico learner"} · Building a mental map of the body`}
              </p>
            </div>
            <div className="mico-profile-actions">
              <button>✎ Edit profile</button>
              <button>Share progress</button>
            </div>
          </div>
          <img src="/mico/mascots/mico-study.png" alt="Mico studying anatomy" />
        </section>
        <section className="mico-profile-milestone">
          <span>YOUR NEXT MILESTONE</span>
          <div>
            <strong>Explore the skeletal system</strong>
            <p>
              Complete one femur challenge to unlock the Bone Builder badge.
            </p>
          </div>
          <button>
            View path <ChevronRight size={16} />
          </button>
        </section>
        <h2 className="mico-profile-heading">Your numbers</h2>
        <section className="mico-profile-stats">
          {stats.map(([icon, value, label, color]) => (
            <article key={label}>
              <i style={{ background: color }}>{icon}</i>
              <div>
                <strong>{value}</strong>
                <small>{label}</small>
              </div>
            </article>
          ))}
        </section>
        <div className="mico-profile-section-head">
          <h2>Achievements</h2>
          <button>View all</button>
        </div>
        <section className="mico-achievement-list">
          {achievements.map(([title, detail, value, total, color]) => {
            const width = Math.min(100, (Number(value) / Number(total)) * 100);
            return (
              <article key={title}>
                <i style={{ background: color }}>✦</i>
                <div>
                  <div>
                    <strong>{title}</strong>
                    <small>
                      {value}/{total}
                    </small>
                  </div>
                  <p>{detail}</p>
                  <span>
                    <em style={{ width: `${width}%`, background: color }} />
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <aside className="mico-profile-rail">
        <section className="mico-profile-circle">
          <div className="mico-circle-tabs">
            <button
              className={tab === "circle" ? "active" : ""}
              onClick={() => setTab("circle")}
            >
              Study circle
            </button>
            <button
              className={tab === "activity" ? "active" : ""}
              onClick={() => setTab("activity")}
            >
              Activity
            </button>
          </div>
          {tab === "circle" ? (
            <>
              <img
                src="/mico/mascots/mico-celebrate.png"
                alt="Mico invites you to study together"
              />
              <h3>Learning sticks together.</h3>
              <p>
                Invite classmates to compare streaks, share milestones, and keep
                each other going.
              </p>
              <button className="mico-profile-primary">
                <Users size={17} />
                Find study buddies
              </button>
            </>
          ) : (
            <div className="mico-activity-empty">
              <span>✦</span>
              <h3>Your activity feed is ready.</h3>
              <p>Complete a lesson to share your first milestone.</p>
            </div>
          )}
        </section>
        <section className="mico-profile-card">
          <span>WEEKLY FOCUS</span>
          <h3>Heart & circulation</h3>
          <p>You’re building confidence with chambers, flow, and valves.</p>
          <div className="mico-focus-row">
            <b>3</b>
            <span>activities complete this week</span>
          </div>
          <button>
            Continue studying <ChevronRight size={16} />
          </button>
        </section>
        <section className="mico-profile-card mico-profile-badges">
          <span>COLLECTED BADGES</span>
          <div>
            <i>♥</i>
            <i>🦴</i>
            <i>✦</i>
            <i>+</i>
          </div>
          <button>
            See badge cabinet <ChevronRight size={16} />
          </button>
        </section>
      </aside>
    </div>
  );
}

function Shop({
  progress,
  setProgress,
  learner,
}: {
  progress: MicoProgress;
  setProgress: Dispatch<SetStateAction<MicoProgress>>;
  learner: MicoLearner;
}) {
  const [notice, setNotice] = useState("");
  const [buying, setBuying] = useState<string | null>(null);
  const buy = async (
    sku: string,
    title: string,
    cost: number,
    kind: "heart" | "freeze" | "pack",
  ) => {
    if (progress.xp < cost) {
      setNotice(`You need ${cost - progress.xp} more gems for ${title}.`);
      return;
    }
    if (learner.demo) {
      setProgress((value) => ({
        ...value,
        xp: value.xp - cost,
        hearts: kind === "heart" ? Math.min(5, value.hearts + 3) : value.hearts,
      }));
      setNotice(`${title} added to this temporary demo kit.`);
      return;
    }
    setBuying(sku);
    try {
      const result = await purchaseShopItem(sku);
      setProgress((value) => ({
        ...value,
        xp: result.xp,
        hearts: result.hearts,
      }));
      setNotice(`${title} added to your synced study kit.`);
    } catch {
      setNotice(
        `We couldn't add ${title} right now. Your gems were not spent.`,
      );
    } finally {
      setBuying(null);
    }
  };
  const buyUnlimited = async () => {
    if (learner.demo) {
      setNotice(
        "The public demo cannot buy passes. Sign in to use your own Mico account.",
      );
      return;
    }
    setBuying("unlimited-hearts-day");
    try {
      window.location.assign(await startUnlimitedHeartsCheckout());
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Checkout is not available yet.",
      );
    } finally {
      setBuying(null);
    }
  };
  const products = [
    [
      "streak-shield",
      "Streak shield",
      "Protect one missed study day",
      "/mico/status/streak-flame.png",
      180,
      "freeze",
    ],
    [
      "heart-refill",
      "Heart refill",
      "Restore three practice hearts",
      "/mico/status/heart-life.png",
      120,
      "heart",
    ],
    [
      "cardio-model-pack",
      "Cardio model pack",
      "Unlock guided heart structures",
      "/study/anatomy/heart/organ.webp",
      240,
      "pack",
    ],
    [
      "neuro-model-pack",
      "Neuro model pack",
      "Unlock brain pathway challenges",
      "/study/anatomy/brain/organ.webp",
      260,
      "pack",
    ],
    [
      "breathing-model-pack",
      "Breathing lab pack",
      "Unlock respiratory review drills",
      "/study/anatomy/lungs/organ.webp",
      220,
      "pack",
    ],
  ] as const;
  return (
    <div className="mico-shop-page">
      <section className="mico-shop-banner">
        <div>
          <span>MICO PLUS</span>
          <h2>Build a stronger study routine.</h2>
          <p>
            Save your streak, refill hearts, and unlock deeper anatomy practice.
          </p>
          <button onClick={() => setNotice("Mico Plus is coming soon.")}>
            Explore Mico Plus <ChevronRight size={17} />
          </button>
        </div>
        <img
          src="/mico/mascots/mico-nutrition.png"
          alt="Mico carries a study supply kit"
        />
      </section>
      <div className="mico-shop-balance">
        <img src="/mico/status/study-gem.png" alt="" />
        <span>
          <b>{progress.xp} gems</b>
          <small>Earn more by completing lessons</small>
        </span>
      </div>
      {notice && (
        <p className="mico-shop-notice" role="status">
          {notice}
        </p>
      )}
      <section className="mico-shop-pass">
        <img src="/mico/status/heart-life.png" alt="" />
        <div>
          <span>ONE-DAY PASS</span>
          <h2>Unlimited hearts for 24 hours</h2>
          <p>Keep practising with no heart loss for one full day.</p>
        </div>
        <button disabled={buying !== null} onClick={buyUnlimited}>
          {buying === "unlimited-hearts-day"
            ? "Opening checkout…"
            : "Get for $1.00"}
        </button>
      </section>
      <ShopSection
        title="Hearts & streaks"
        caption="Keep your momentum when study days get busy."
        products={products.slice(0, 2)}
        buying={buying}
        onBuy={buy}
      />
      <ShopSection
        title="3D model packs"
        caption="Open richer structures, landmarks, and clinical practice."
        products={products.slice(2)}
        buying={buying}
        onBuy={buy}
      />
    </div>
  );
}
function ShopSection({
  title,
  caption,
  products,
  buying,
  onBuy,
}: {
  title: string;
  caption: string;
  products: readonly (readonly [
    string,
    string,
    string,
    string,
    number,
    "heart" | "freeze" | "pack",
  ])[];
  buying: string | null;
  onBuy: (
    sku: string,
    title: string,
    cost: number,
    kind: "heart" | "freeze" | "pack",
  ) => void;
}) {
  return (
    <section className="mico-shop-section">
      <div className="mico-shop-section-title">
        <div>
          <span>STUDY SUPPLIES</span>
          <h2>{title}</h2>
          <p>{caption}</p>
        </div>
      </div>
      <div className="mico-shop-items">
        {products.map(([sku, title, description, image, cost, kind]) => (
          <article key={sku}>
            <div className="mico-shop-item-art">
              <img src={image} alt="" />
            </div>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <button
              disabled={buying !== null}
              onClick={() => onBuy(sku, title, cost, kind)}
            >
              <span>{buying === sku ? "Adding…" : "Get for"}</span>
              <img src="/mico/status/study-gem.png" alt="" />
              {cost}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Practice({
  progress,
  start,
}: {
  progress: MicoProgress;
  start: (lesson: Lesson) => void;
}) {
  const [practiceMode, setPracticeMode] = useState<
    "hub" | "flashcards" | "imaging"
  >("hub");
  const open = (id: string) =>
    id === "heart-flow"
      ? setPracticeMode("flashcards")
      : id === "anatomy-map"
        ? setPracticeMode("imaging")
        : start(allLessons.find((item) => item.id === id) ?? allLessons[0]);
  const collections = [
    [
      "Heart rewind",
      "Trace chambers, valves, and flow",
      "heart",
      "heart-chambers",
    ],
    [
      "Skeletal lab",
      "Name landmarks from a rotating femur",
      "bone",
      "skeletal-1",
    ],
    [
      "Muscle lab",
      "Flex, extend, and diagnose upper-arm movement",
      "cards",
      "muscle-1",
    ],
    ["Neuro signals", "Reconnect regions and pathways", "brain", "brain-1"],
    [
      "Respiratory rounds",
      "Review airways and gas exchange",
      "lungs",
      "resp-1",
    ],
    [
      "Imaging views",
      "Practice planes and cross-sections",
      "scan",
      "anatomy-map",
    ],
    [
      "Clinical flashcards",
      "Fast recall from mini cases",
      "cards",
      "heart-flow",
    ],
  ];
  const drills = [
    [
      "Listen & identify",
      "Auscultation-style heart sounds",
      "/mico/mascots/mico-breathe.png",
      "heart-chambers",
    ],
    [
      "Rapid recall",
      "A 90-second anatomy sprint",
      "/mico/mascots/mico-point.png",
      "anatomical-position",
    ],
    [
      "Model explorer",
      "Rotate, zoom, and label structures",
      "/study/anatomy/heart/organ.webp",
      "skeletal-1",
    ],
    [
      "Muscle map",
      "Trace biceps, triceps, and elbow action",
      "/mico/mascots/mico-study.png",
      "muscle-1",
    ],
    [
      "Lab bench",
      "Function-first clinical practice",
      "/study/anatomy/brain/organ.webp",
      "brain-1",
    ],
  ];
  if (practiceMode === "flashcards") {
    return <ClinicalFlashcards onBack={() => setPracticeMode("hub")} />;
  }
  if (practiceMode === "imaging") {
    return <ImagingViews onBack={() => setPracticeMode("hub")} />;
  }
  return (
    <div className="mico-practice-hub">
      <div className="mico-practice-main">
        <p className="mico-practice-overline">TODAY’S REVIEW</p>
        <section className="mico-rewind-banner">
          <div className="mico-rewind-copy">
            <span>MICO PLUS</span>
            <h2>Unit Rewind</h2>
            <p>
              Bring the foundations back into focus with a quick, high-yield
              review.
            </p>
            <button onClick={() => open("anatomical-position")}>
              Start rewind <ChevronRight size={18} />
            </button>
          </div>
          <div className="mico-rewind-art" aria-hidden="true">
            <i className="mico-practice-art scan" />
            <i className="mico-practice-art bone" />
            <img src="/mico/mascots/mico-study.png" alt="" />
          </div>
        </section>
        <section className="mico-practice-metrics">
          <article>
            <img
              className="mico-practice-status-image"
              src="/mico/status/streak-flame.png"
              alt=""
            />
            <div>
              <b>{progress.streak} day streak</b>
              <small>One review keeps it alive</small>
            </div>
          </article>
          <article>
            <img
              className="mico-practice-status-image"
              src="/mico/status/heart-life.png"
              alt=""
            />
            <div>
              <b>{progress.hearts} hearts ready</b>
              <small>Gentle practice, real retention</small>
            </div>
          </article>
          <article>
            <img
              className="mico-practice-status-image"
              src="/mico/status/study-gem.png"
              alt=""
            />
            <div>
              <b>{progress.xp} gems earned</b>
              <small>Powered by your study time</small>
            </div>
          </article>
        </section>
        <div className="mico-practice-section-head">
          <div>
            <span>CONVERSATION</span>
            <h2>Practice modes</h2>
          </div>
          <button onClick={() => open("heart-chambers")}>
            Start a session <ChevronRight size={16} />
          </button>
        </div>
        <section className="mico-practice-drills">
          {drills.map(([title, description, image, id]) => (
            <button key={title} onClick={() => open(id)}>
              <img className="mico-practice-illustration" src={image} alt="" />
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
              <ChevronRight size={19} />
            </button>
          ))}
        </section>
        <div className="mico-practice-section-head">
          <div>
            <span>YOUR COLLECTIONS</span>
            <h2>Learn it your way</h2>
          </div>
          <button onClick={() => open("anatomy-map")}>
            View all <ChevronRight size={16} />
          </button>
        </div>
        <section className="mico-practice-collections">
          {collections.map(([title, description, art, id]) => (
            <button key={title} onClick={() => open(id)}>
              <i className={`mico-practice-art ${art}`} />
              <span>
                <b>{title}</b>
                <small>{description}</small>
              </span>
              <ChevronRight size={19} />
            </button>
          ))}
        </section>
      </div>
      <aside className="mico-practice-aside">
        <section className="mico-practice-mascot">
          <img
            src="/mico/mascots/mico-celebrate.png"
            alt="Mico celebrates progress"
          />
          <span>MICO MOMENT</span>
          <h3>Your anatomy streak is glowing.</h3>
          <p>Complete one focused activity to protect it today.</p>
          <button onClick={() => open("heart-chambers")}>
            Keep streak alive
          </button>
        </section>
        <section className="mico-practice-scan">
          <i className="mico-practice-art microscope" />
          <h3>3D quick study</h3>
          <p>Explore a body system and learn from every angle.</p>
          <button onClick={() => open("skeletal-1")}>
            Open 3D lab <ChevronRight size={16} />
          </button>
        </section>
      </aside>
    </div>
  );
}

const clinicalCards = [
  {
    topic: "Blood flow",
    prompt: "Which chamber pumps oxygenated blood into the aorta?",
    answer: "Left ventricle",
    detail:
      "Its thick myocardium generates the pressure required for systemic circulation.",
  },
  {
    topic: "Valves",
    prompt:
      "Which valve prevents backflow from the left ventricle into the left atrium?",
    answer: "Mitral (bicuspid) valve",
    detail:
      "It closes during ventricular systole, keeping blood moving toward the aorta.",
  },
  {
    topic: "Vessels",
    prompt:
      "Which vessels return oxygenated blood from the lungs to the heart?",
    answer: "Pulmonary veins",
    detail:
      "They empty into the left atrium—an important exception to the usual vein rule.",
  },
  {
    topic: "Surface anatomy",
    prompt:
      "The apex beat is usually felt in which intercostal space at the midclavicular line?",
    answer: "Left fifth intercostal space",
    detail:
      "It approximates the position of the cardiac apex against the thoracic wall.",
  },
];

function ClinicalFlashcards({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const card = clinicalCards[index];
  const move = (direction: -1 | 1) => {
    setIndex((value) =>
      Math.min(clinicalCards.length - 1, Math.max(0, value + direction)),
    );
    setFlipped(false);
  };
  const markKnown = () => {
    setKnown((value) => (value.includes(index) ? value : [...value, index]));
    if (index < clinicalCards.length - 1) move(1);
  };
  return (
    <section className="mico-practice-session" aria-label="Clinical flashcards">
      <button className="mico-practice-back" onClick={onBack}>
        ← Back to practice
      </button>
      <div className="mico-practice-session-head">
        <div>
          <span>CLINICAL FLASHCARDS</span>
          <h2>Fast recall, real anatomy</h2>
          <p>Tap the card to reveal the answer, then mark what you know.</p>
        </div>
        <b>
          {known.length}/{clinicalCards.length} known
        </b>
      </div>
      <button
        className={`mico-flashcard ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? "Show question" : "Reveal answer"}
      >
        <span className="mico-flashcard-face mico-flashcard-front">
          <small>{card.topic}</small>
          <strong>{card.prompt}</strong>
          <em>Tap to reveal</em>
        </span>
        <span className="mico-flashcard-face mico-flashcard-back">
          <small>ANSWER</small>
          <strong>{card.answer}</strong>
          <em>{card.detail}</em>
        </span>
      </button>
      <div className="mico-flashcard-controls">
        <button disabled={index === 0} onClick={() => move(-1)}>
          Previous
        </button>
        <span>
          {index + 1} of {clinicalCards.length}
        </span>
        <button className="mico-flashcard-know" onClick={markKnown}>
          {known.includes(index) ? "Known ✓" : "I knew this"}
        </button>
        <button
          disabled={index === clinicalCards.length - 1}
          onClick={() => move(1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}

const imagingPlanes = {
  axial: {
    name: "Axial (transverse)",
    note: "Slices the body into superior and inferior portions.",
    className: "axial",
    image: "/mico/imaging/axial-plane.png",
  },
  coronal: {
    name: "Coronal (frontal)",
    note: "Separates anterior from posterior anatomy.",
    className: "coronal",
    image: "/mico/imaging/coronal-plane.png",
  },
  sagittal: {
    name: "Sagittal",
    note: "Separates left from right anatomy.",
    className: "sagittal",
    image: "/mico/imaging/sagittal-plane.png",
  },
} as const;

function ImagingViews({ onBack }: { onBack: () => void }) {
  const [plane, setPlane] = useState<keyof typeof imagingPlanes>("axial");
  const [choice, setChoice] = useState("");
  const active = imagingPlanes[plane];
  return (
    <section
      className="mico-practice-session"
      aria-label="Imaging orientation lab"
    >
      <button className="mico-practice-back" onClick={onBack}>
        ← Back to practice
      </button>
      <div className="mico-practice-session-head">
        <div>
          <span>IMAGING VIEWS</span>
          <h2>Build your spatial orientation</h2>
          <p>Choose a plane, inspect its cut, then answer the mini-check.</p>
        </div>
        <b>{active.name}</b>
      </div>
      <div className="mico-imaging-lab">
        <figure
          className={`mico-imaging-figure ${active.className}`}
          aria-label={`${active.name} body plane diagram`}
        >
          <img
            src={active.image}
            alt={`${active.name} plane through an anatomical study model`}
          />
          <span>{active.name}</span>
        </figure>
        <div className="mico-imaging-copy">
          <h3>{active.name}</h3>
          <p>{active.note}</p>
          <div
            className="mico-imaging-controls"
            role="group"
            aria-label="Choose a body plane"
          >
            {Object.entries(imagingPlanes).map(([key, item]) => (
              <button
                key={key}
                className={plane === key ? "active" : ""}
                onClick={() => {
                  setPlane(key as keyof typeof imagingPlanes);
                  setChoice("");
                }}
                aria-pressed={plane === key}
              >
                {item.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="mico-imaging-check">
            <strong>
              Which plane divides the body into left and right portions?
            </strong>
            <div>
              {Object.keys(imagingPlanes).map((key) => (
                <button
                  key={key}
                  className={
                    choice === key
                      ? key === "sagittal"
                        ? "correct"
                        : "wrong"
                      : ""
                  }
                  onClick={() => setChoice(key)}
                >
                  {
                    imagingPlanes[key as keyof typeof imagingPlanes].name.split(
                      " ",
                    )[0]
                  }
                </button>
              ))}
            </div>
            {choice && (
              <p className={choice === "sagittal" ? "correct" : "wrong"}>
                {choice === "sagittal"
                  ? "Correct — sagittal separates left and right."
                  : choice === "coronal"
                    ? "Coronal separates front and back. The sagittal plane runs from front to back and separates left and right."
                    : "Axial separates top and bottom. The sagittal plane runs from front to back and separates left and right."}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Leaderboard({ progress }: { progress: MicoProgress }) {
  const rows = [
    ["Maya R.", 2840],
    ["Jordan K.", 2610],
    ["Nia P.", 2105],
    ["Owen S.", 1940],
    ["Guest learner", progress.xp],
  ].sort((a, b) => (b[1] as number) - (a[1] as number));
  return (
    <div className="mico-page-layout">
      <div className="mico-league">
        <section className="mico-league-head">
          <div>◈　◈　◈　◈</div>
          <h2>Bronze League</h2>
          <p>
            This week’s study league begins in <b>4 hours</b>
          </p>
        </section>
        <section className="mico-league-list">
          {rows.map(([name, xp], index) => (
            <div
              className={name === "Guest learner" ? "you" : ""}
              key={String(name)}
            >
              <span>{index + 1}</span>
              <i>{String(name)[0]}</i>
              <b>{name}</b>
              <small>{xp} XP</small>
            </div>
          ))}
        </section>
      </div>
      <aside className="mico-rail">
        <section className="mico-card mico-status">
          <div>
            <span className="mico-avatar">A</span>
            <i>◉</i>
          </div>
          <h3>Set your study status</h3>
          <p>Show classmates what you’re working on.</p>
          <button>🧠</button>
          <button>🫀</button>
          <button>🦴</button>
          <button>🔬</button>
        </section>
        <section className="mico-card">
          <h3>League rules</h3>
          <p>Earn XP from lessons to climb the anatomy league.</p>
        </section>
      </aside>
    </div>
  );
}

function LessonPlayer({
  lesson,
  progress,
  setProgress,
  onExit,
  onExplore,
  learner,
  soundEnabled,
  onToggleSound,
}: {
  lesson: Lesson;
  progress: MicoProgress;
  setProgress: Dispatch<SetStateAction<MicoProgress>>;
  onExit: () => void;
  onExplore: (concept?: string) => void;
  learner: MicoLearner;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  const [step, setStep] = useState(0),
    [answer, setAnswer] = useState<ActivityAnswer | undefined>(),
    [status, setStatus] = useState<"idle" | "right" | "wrong">("idle"),
    [correct, setCorrect] = useState(0),
    [saving, setSaving] = useState(false),
    [economyError, setEconomyError] = useState(""),
    [earned, setEarned] = useState(0);
  const activity = lesson.activities[step],
    finish = step === lesson.activities.length;
  const ready =
    !!answer &&
    (activity?.kind !== "sequence-flow" ||
      (Array.isArray(answer.value) &&
        answer.value.length === activity.steps.length));
  const check = async () => {
    if (!activity || !ready || saving) return;
    const isCorrect = isActivityCorrect(activity, answer);
    const final = step === lesson.activities.length - 1;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    const score = Math.round((nextCorrect / lesson.activities.length) * 100);
    setEconomyError("");
    setSaving(true);
    try {
      if (learner.demo) {
        const award = (isCorrect ? 10 : 0) + (final ? 50 : 0);
        setEarned((value) => value + award);
        setProgress((v) => ({
          ...v,
          xp: v.xp + award,
          dailyXp: v.dailyXp + award,
          hearts: v.hearts,
          mastery: isCorrect
            ? {
                ...v.mastery,
                [activity.concept ?? lesson.title]: Math.min(
                  100,
                  (v.mastery[activity.concept ?? lesson.title] ?? 0) + 12,
                ),
              }
            : v.mastery,
          completed: final
            ? [...new Set([...v.completed, lesson.id])]
            : v.completed,
        }));
      } else {
        const result = await recordLearningResult({
          lessonId: lesson.id,
          activityId: `${lesson.id}:${step + 1}`,
          activityKind: activity.kind,
          correct: isCorrect,
          answer: answer?.value,
          concept: activity.concept ?? lesson.title,
          isFinal: final,
          score,
        });
        setEarned((value) => value + result.awarded_xp);
        setProgress((v) => applyLearningResult(v, result));
      }
      playMicoSound(isCorrect ? "correct" : "incorrect", soundEnabled);
      setStatus(isCorrect ? "right" : "wrong");
      if (isCorrect) setCorrect((value) => value + 1);
      if (final) playMicoSound("complete", soundEnabled);
    } catch (error) {
      setEconomyError(
        error instanceof Error && error.message.includes("No hearts")
          ? "You are out of hearts. Visit the Shop for a refill or an unlimited-hearts day pass."
          : "We could not save this result. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  const next = () => {
    if (!activity) return;
    if (step === lesson.activities.length - 1) {
      setStep((s) => s + 1);
    } else {
      setStep((s) => s + 1);
      setAnswer(undefined);
      setStatus("idle");
    }
  };
  if (finish) {
    const score = Math.round((correct / lesson.activities.length) * 100);
    return (
      <div className="mico-lesson mico-result">
        <div className="mico-result-badge">✦</div>
        <span>LESSON COMPLETE</span>
        <h2>That was a smart move.</h2>
        <p>You’ve added a new piece to your mental map.</p>
        <div className="mico-result-stats">
          <div>
            <b>{score}%</b>
            <small>mastery score</small>
          </div>
          <div>
            <b>+{earned}</b>
            <small>XP earned</small>
          </div>
        </div>
        <button className="mico-primary" onClick={onExit}>
          Back to your path <ChevronRight size={18} />
        </button>
      </div>
    );
  }
  return (
    <div className="mico-lesson">
      <header>
        <button onClick={onExit}>×</button>
        <div>
          <i style={{ width: `${(step / lesson.activities.length) * 100}%` }} />
        </div>
        <button
          className="mico-lesson-sound"
          onClick={onToggleSound}
          aria-label={
            soundEnabled ? "Mute sound effects" : "Enable sound effects"
          }
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <span>
          <Heart size={18} fill="currentColor" />
          {learner.demo ? "∞" : progress.hearts}
          {!learner.demo && progress.unlimitedHeartsUntil && <small>∞</small>}
        </span>
      </header>
      <section>
        <span className="mico-kicker">
          {activity.kind === "type-label" ||
          activity.kind === "function-from-model"
            ? "3D ANATOMY CHALLENGE"
            : "ACTIVITY"}{" "}
          {step + 1} OF {lesson.activities.length}
        </span>
        <h2>{activity.prompt}</h2>
        <MicoActivityPlayer
          activity={activity}
          disabled={status !== "idle" || saving}
          onAnswerChange={setAnswer}
          onInteraction={(sound) => playMicoSound(sound, soundEnabled)}
        />
        {status === "wrong" && activity.concept && (
          <button
            className="mico-explore-link"
            onClick={() => onExplore(activity.concept)}
          >
            Study {activity.concept} in the Atlas <ChevronRight size={16} />
          </button>
        )}
      </section>
      <footer
        className={
          status === "right" ? "success" : status === "wrong" ? "failure" : ""
        }
      >
        {status === "right" ? (
          <span>Great! {activity.explanation}</span>
        ) : status === "wrong" ? (
          <span>Not quite. {activity.explanation}</span>
        ) : (
          <span>{economyError}</span>
        )}
        <button
          disabled={
            saving ||
            !ready ||
            (!learner.demo &&
              progress.hearts === 0 &&
              !progress.unlimitedHeartsUntil)
          }
          onClick={status === "idle" ? check : next}
        >
          {saving
            ? "Saving…"
            : status === "idle"
              ? !learner.demo &&
                progress.hearts === 0 &&
                !progress.unlimitedHeartsUntil
                ? "Out of hearts"
                : "Check answer"
              : "Continue"}
          <ChevronRight size={18} />
        </button>
      </footer>
    </div>
  );
}
