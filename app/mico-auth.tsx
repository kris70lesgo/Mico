import { Check, Play, Sparkles } from "lucide-react";
import "./mico-auth.css";

type Props = { onDemo: () => void };

/**
 * The public build intentionally has one entry point. Personal authentication
 * remains in the codebase for later, but is not exposed while Mico is in demo.
 */
export default function MicoAuth({ onDemo }: Props) {
  return (
    <main className="mico-auth">
      <section className="mico-auth-story">
        <div className="mico-auth-brand" aria-label="Mico">
          <span>m</span>Mico
        </div>
        <div className="mico-auth-orbit orbit-a" />
        <div className="mico-auth-orbit orbit-b" />
        <div className="mico-auth-story-copy">
          <span>INTERACTIVE ANATOMY</span>
          <h1>Build your mental map of the human body.</h1>
          <p>
            Short lessons, living 3D models, and a study routine built for
            exploration.
          </p>
          <ul>
            <li>
              <Check size={16} />
              Explore real anatomy models
            </li>
            <li>
              <Check size={16} />
              Try interactive lessons and practice labs
            </li>
            <li>
              <Check size={16} />
              No account required during the public demo
            </li>
          </ul>
        </div>
        <img
          src="/mico/mascots/mico-study.png"
          alt="Mico studies an anatomical heart"
        />
      </section>
      <section className="mico-auth-panel">
        <div className="mico-auth-card mico-auth-demo-card">
          <div className="mico-auth-card-top">
            <div className="mico-auth-mark">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mico-auth-copy">
            <span>PUBLIC DEMO</span>
            <h2>Explore Mico</h2>
            <p>
              Enter the full interactive preview—lessons, practice labs, and the
              3D anatomy atlas are ready to try.
            </p>
          </div>
          <button className="mico-auth-submit mico-auth-demo" onClick={onDemo}>
            <Play size={18} fill="currentColor" />
            Enter demo
          </button>
          <p className="mico-auth-legal">
            Demo progress is local to this browser and is not connected to an
            account.
          </p>
        </div>
      </section>
    </main>
  );
}
