import type { Metadata } from "next";
import LegalLayout from "../components/LegalLayout";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung – UpMaDo",
  description: "Widerrufsbelehrung und Muster-Widerrufsformular für den Audio-Mastering-Dienst UpMaDo.",
};

const SECTIONS = [
  { id: "kostenlos",     label: "Free-Tarif" },
  { id: "paypertrack",   label: "Pay per Track" },
  { id: "abonnements",   label: "Abonnements" },
  { id: "folgen",        label: "Folgen des Widerrufs" },
  { id: "formular",      label: "Muster-Widerrufsformular" },
];

export default function WiderrufPage() {
  return (
    <LegalLayout title="Widerrufsbelehrung" activePage="widerruf" sections={SECTIONS}>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.75, marginBottom: "2rem" }}>
        Das Widerrufsrecht hängt von der gewählten Nutzungsart ab. Bitte lesen Sie den für
        Sie zutreffenden Abschnitt.
      </p>

      {/* ── Free ────────────────────────────────────── */}
      <div className="legal-section" id="kostenlos">
        <h2>A) Free-Tarif — Kein Widerrufsrecht</h2>
        <p>
          Die kostenlose Nutzung von UpMaDo begründet kein entgeltliches Vertragsverhältnis.
          Ein gesetzliches Widerrufsrecht im Sinne des § 355 BGB ist daher nicht anwendbar.
        </p>
      </div>

      {/* ── Pay per Track ───────────────────────────── */}
      <div className="legal-section" id="paypertrack">
        <h2>B) Pay per Track — Einzelkauf einer digitalen Dienstleistung</h2>
        <p>
          Beim Kauf eines einzelnen Mastering-Auftrags (Pay per Track) schließen Sie einen
          Vertrag über die Erbringung einer digitalen Dienstleistung ab.
        </p>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Widerrufsrecht:</strong>{" "}
          Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss zu.
        </p>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Vorzeitiges Erlöschen gemäß § 356 Abs. 5 BGB:</strong>{" "}
          Das Widerrufsrecht erlischt, sobald der Anbieter mit der Ausführung des Vertrags
          (der Mastering-Verarbeitung) begonnen hat, nachdem Sie
        </p>
        <ul>
          <li>
            ausdrücklich zugestimmt haben, dass der Anbieter vor Ablauf der Widerrufsfrist
            mit der Ausführung beginnt, <strong>und</strong>
          </li>
          <li>
            Ihre Kenntnis davon bestätigt haben, dass Sie durch diese Zustimmung Ihr
            Widerrufsrecht verlieren.
          </li>
        </ul>
        <p>
          Diese Bestätigung erfolgt durch eine Checkbox im Checkout-Prozess, die Sie
          vor dem Kauf aktiv anklicken müssen. Ohne diese Bestätigung wird der Dienst
          nicht ausgeführt.
        </p>
        <p>
          Um Ihr Widerrufsrecht (sofern nicht erloschen) auszuüben, kontaktieren Sie uns
          per E-Mail an{" "}
          <a href="mailto:info@re-beatz.com">info@re-beatz.com</a> mit einer eindeutigen
          Erklärung. Das Muster-Widerrufsformular finden Sie unten.
        </p>
      </div>

      {/* ── Abonnements ─────────────────────────────── */}
      <div className="legal-section" id="abonnements">
        <h2>C) Abonnements (Creator, Pro, Pro+, Studio)</h2>
        <p>
          Bei Abschluss eines Abonnements (monatlich oder jährlich) schließen Sie einen
          Dienstleistungsvertrag ab.
        </p>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Widerrufsfrist:</strong>{" "}
          Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen. Die Frist beginnt mit dem Tag des Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
          (Michael Clas · UpMaDo · Plaidter Str. 31 · 56648 Saffig,
          E-Mail: <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>) mittels einer
          eindeutigen Erklärung über Ihren Entschluss informieren, diesen Vertrag zu
          widerrufen. Sie können das unten stehende Muster-Widerrufsformular verwenden,
          das jedoch nicht vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
          Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Hinweis zum vorzeitigen Erlöschen:</strong>{" "}
          Auch bei Abonnements erlischt das Widerrufsrecht vorzeitig gemäß § 356 Abs. 5 BGB,
          wenn Sie ausdrücklich zugestimmt haben, dass der Dienst vor Ablauf der
          Widerrufsfrist beginnt, und Ihre Kenntnis über den damit verbundenen Rechtsverlust
          bestätigt haben.
        </p>
      </div>

      {/* ── Folgen des Widerrufs ─────────────────────── */}
      <div className="legal-section" id="folgen">
        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag wirksam widerrufen, haben wir Ihnen alle Zahlungen,
          die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen 14 Tagen
          ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns
          eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel,
          das Sie bei der ursprünglichen Transaktion eingesetzt haben; in keinem Fall
          werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
        </p>
        <p>
          Hat die Ausführung der Dienstleistung (z. B. ein Abrechnungszeitraum des
          Abonnements) bereits begonnen, sind Sie verpflichtet, uns einen anteiligen
          Betrag für die bis zum Widerruf erbrachten Leistungen zu zahlen. Der anteilige
          Betrag errechnet sich aus dem Gesamtpreis des Abonnements im Verhältnis zum
          Zeitraum bis zur Erklärung des Widerrufs.
        </p>
      </div>

      {/* ── Musterformular ──────────────────────────── */}
      <div className="legal-section" id="formular">
        <h2>Muster-Widerrufsformular</h2>
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus
          und senden Sie es per E-Mail an{" "}
          <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>.)
        </p>
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          padding: "1.5rem 1.75rem",
          marginTop: "1rem",
          lineHeight: 1.9,
        }}>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "var(--text-primary)" }}>An:</strong><br />
            Michael Clas · UpMaDo<br />
            Plaidter Str. 31 · 56648 Saffig<br />
            E-Mail: info@re-beatz.com
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag
            über die Erbringung der folgenden Dienstleistung (*):
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            Tarif / Produkt: ___________________________
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            Bestellt am (*) / Vertrag abgeschlossen am (*): ___________________________
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            Name des/der Verbraucher(s): ___________________________
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            Anschrift des/der Verbraucher(s): ___________________________
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            E-Mail-Adresse des Kontos: ___________________________
          </p>
          <p style={{ marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ___________________________
          </p>
          <p style={{ marginBottom: 0, color: "var(--text-muted)" }}>
            Datum: ___________________________
          </p>
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
            (*) Unzutreffendes streichen.
          </p>
        </div>
      </div>

      <div className="legal-meta">
        Stand: März 2026 · Michael Clas · UpMaDo · <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>
      </div>
    </LegalLayout>
  );
}
