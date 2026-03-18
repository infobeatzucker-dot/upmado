import type { Metadata } from "next";
import LegalLayout from "../components/LegalLayout";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung – UpMaDo",
};

export default function WiderrufPage() {
  return (
    <LegalLayout title="Widerrufsbelehrung">

      <div className="legal-section">
        <h2>Widerrufsrecht</h2>
        <p>
          Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
          widerrufen.
        </p>
        <p>
          Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Michael Clas, UpMaDo,
          Plaidter Str. 31, 56648 Saffig, E-Mail:{" "}
          <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>) mittels einer eindeutigen
          Erklärung (z.B. eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
          informieren. Sie können dafür das unten beigefügte Muster-Widerrufsformular verwenden,
          das jedoch nicht vorgeschrieben ist.
        </p>
        <p>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung
          des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
        </p>
      </div>

      <div className="legal-section">
        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
          erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
          zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
          eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie
          bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde
          ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
          Rückzahlung Entgelte berechnet.
        </p>
      </div>

      <div className="legal-section">
        <h2>Besondere Hinweise zu digitalen Dienstleistungen</h2>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Hinweis gemäß § 356 Abs. 5 BGB:</strong><br />
          Ihr Widerrufsrecht erlischt bei einem Vertrag über die Lieferung von digitalen Inhalten,
          die nicht auf einem körperlichen Datenträger geliefert werden, auch dann, wenn der
          Unternehmer mit der Ausführung des Vertrags begonnen hat, nachdem der Verbraucher
        </p>
        <ul>
          <li>
            ausdrücklich zugestimmt hat, dass der Unternehmer mit der Ausführung des Vertrags
            vor Ablauf der Widerrufsfrist beginnt, und
          </li>
          <li>
            seine Kenntnis davon bestätigt hat, dass er durch seine Zustimmung mit Beginn der
            Ausführung des Vertrags sein Widerrufsrecht verliert.
          </li>
        </ul>
        <p>
          Bei UpMaDo: Wenn Sie bei der Bestellung eines Abonnements ausdrücklich bestätigt haben,
          dass der Dienst sofort beginnen soll, und Ihre Kenntnis über den Verlust des
          Widerrufsrechts bestätigt haben, erlischt Ihr Widerrufsrecht mit Beginn der
          Dienstleistungserbringung.
        </p>
      </div>

      <div className="legal-section">
        <h2>Muster-Widerrufsformular</h2>
        <p>
          (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und
          senden Sie es per E-Mail an{" "}
          <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>.)
        </p>
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "1.5rem",
          marginTop: "1rem",
        }}>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "var(--text-primary)" }}>An:</strong><br />
            Michael Clas · UpMaDo<br />
            Plaidter Str. 31 · 56648 Saffig<br />
            E-Mail: info@re-beatz.com
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den
            Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)
          </p>
          <p style={{ marginBottom: "0.5rem" }}>Bestellt am (*) / erhalten am (*): ___________________________</p>
          <p style={{ marginBottom: "0.5rem" }}>Name des/der Verbraucher(s): ___________________________</p>
          <p style={{ marginBottom: "0.5rem" }}>Anschrift des/der Verbraucher(s): ___________________________</p>
          <p style={{ marginBottom: "0.5rem" }}>E-Mail-Adresse des Kontos: ___________________________</p>
          <p style={{ marginBottom: "0.5rem" }}>
            Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ___________________________
          </p>
          <p style={{ marginBottom: 0 }}>Datum: ___________________________</p>
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
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
