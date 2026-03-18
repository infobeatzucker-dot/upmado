import type { Metadata } from "next";
import LegalLayout from "../components/LegalLayout";

export const metadata: Metadata = {
  title: "AGB – UpMaDo",
};

export default function AGBPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen">

      <div className="legal-section">
        <h2>§ 1 Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
          Michael Clas, UpMaDo, Plaidter Str. 31, 56648 Saffig (nachfolgend „Anbieter") und den
          Nutzern des Online-Mastering-Dienstes unter upmado.com. Mit der Registrierung oder
          Nutzung des Dienstes stimmt der Nutzer diesen AGB zu. Entgegenstehende oder abweichende
          Bedingungen des Nutzers werden nicht anerkannt.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 2 Leistungsbeschreibung</h2>
        <p>
          UpMaDo bietet einen automatisierten Audio-Mastering-Dienst an. Der Dienst umfasst die
          Verarbeitung von Audiodateien durch eine mehrstufige DSP-Signalkette (u.a. EQ,
          Kompression, Stereo-Optimierung, LUFS-Normalisierung, True-Peak-Limiting) sowie die
          Bereitstellung von Download-Formaten (WAV/FLAC/MP3 in verschiedenen Qualitäten).
        </p>
        <p>
          Zusätzlich stehen folgende Features zur Verfügung: KI-gestützte Parameterauswahl via
          Claude AI, Referenz-Track-Upload für AI-Matching, Mastering-Intensity-Regler,
          Plattform-spezifische Loudness-Normalisierung sowie ein Mastering-Report als PDF.
          Der Anbieter behält sich vor, den Dienst jederzeit zu ändern, zu erweitern oder
          einzustellen.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 3 Nutzerkonto</h2>
        <p>
          Die Nutzung des kostenpflichtigen Angebots kann eine Registrierung voraussetzen. Der
          Nutzer ist verpflichtet, wahrheitsgemäße und vollständige Angaben zu machen und diese
          aktuell zu halten. Die Zugangsdaten sind vertraulich zu behandeln und vor unbefugtem
          Zugriff zu schützen. Der Nutzer haftet für alle Aktivitäten, die unter seinem Konto
          stattfinden. Der Anbieter behält sich vor, Konten bei Verstößen gegen diese AGB zu
          sperren oder zu löschen.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 4 Preise und Zahlung</h2>
        <p>
          Die aktuellen Preise sind auf der Preisseite unter upmado.com/pricing einsehbar.
          Alle Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer (19 % MwSt.).
          Die Abrechnung erfolgt im Voraus für den jeweiligen Abrechnungszeitraum. Mangels
          ausdrücklicher anderweitiger Vereinbarung verlängert sich ein Abonnement automatisch,
          wenn es nicht rechtzeitig gekündigt wird.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 5 Widerrufsrecht</h2>
        <p>
          Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss zu.
          Die vollständige Widerrufsbelehrung und das Muster-Widerrufsformular finden Sie unter{" "}
          <a href="/widerruf">upmado.com/widerruf</a>.
        </p>
        <p>
          Hinweis gemäß § 356 Abs. 5 BGB: Bei digitalen Dienstleistungen, die auf ausdrücklichen
          Wunsch des Verbrauchers sofort nach Vertragsschluss beginnen, erlischt das
          Widerrufsrecht, sobald der Anbieter mit der Ausführung begonnen hat.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 6 Kündigung</h2>
        <p>
          Der Nutzer kann sein Abonnement jederzeit zum Ende des laufenden Abrechnungszeitraums
          kündigen. Nach der Kündigung bleibt der Zugang bis zum Ende des bezahlten Zeitraums
          erhalten. Eine Kündigung durch den Anbieter ist bei schwerwiegenden Verstößen gegen
          diese AGB fristlos möglich.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 7 Nutzungsrechte und Urheberrecht</h2>
        <p>
          Der Nutzer versichert, dass er über alle notwendigen Rechte an den hochgeladenen
          Audiodateien verfügt und durch die Nutzung des Dienstes keine Rechte Dritter verletzt
          werden. Die durch UpMaDo erstellten gemasterten Audiodateien sind für den persönlichen
          und kommerziellen Gebrauch des Nutzers bestimmt. UpMaDo beansprucht kein Urheberrecht
          an den verarbeiteten Dateien. Der Nutzer stellt den Anbieter von sämtlichen Ansprüchen
          Dritter frei, die aus einer Verletzung von Rechten Dritter durch die vom Nutzer
          hochgeladenen Inhalte entstehen.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 8 Datenschutz</h2>
        <p>
          Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
          <a href="/datenschutz">Datenschutzerklärung</a>. Hochgeladene Audiodateien werden nach
          der Verarbeitung automatisch und vollständig gelöscht und nicht dauerhaft gespeichert.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 9 Haftungsbeschränkung</h2>
        <p>
          Der Anbieter haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem
          Verhalten beruhen. Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung
          einer wesentlichen Vertragspflicht (Kardinalpflicht), beschränkt auf den vorhersehbaren,
          vertragstypischen Schaden. Eine Haftung für indirekte Schäden, entgangenen Gewinn oder
          den Verlust von Audiodaten ist — soweit gesetzlich zulässig — ausgeschlossen.
        </p>
        <p>
          Der Anbieter übernimmt keine Garantie für eine ununterbrochene Verfügbarkeit des
          Dienstes. Für die Qualität der Bearbeitung durch den automatisierten Dienst wird keine
          Gewähr für ein bestimmtes künstlerisches Ergebnis übernommen.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 10 Geltendes Recht und Gerichtsstand</h2>
        <p>
          Es gilt ausschließlich das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts (CISG). Als Gerichtsstand wird — soweit gesetzlich zulässig — Koblenz
          vereinbart.
        </p>
      </div>

      <div className="legal-section">
        <h2>§ 11 Schlussbestimmungen</h2>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
          Wirksamkeit der übrigen Bestimmungen davon unberührt. Der Anbieter behält sich das
          Recht vor, diese AGB mit angemessener Frist (mindestens 30 Tage) zu ändern. Änderungen
          werden dem Nutzer per E-Mail mitgeteilt. Widerspricht der Nutzer nicht innerhalb der
          Frist, gelten die neuen AGB als akzeptiert. Ausgenommen von dieser Zustimmungsfiktion
          sind Preisänderungen sowie wesentliche Einschränkungen der vertraglich vereinbarten
          Leistungen; für diese ist stets die ausdrückliche gesonderte Zustimmung des Nutzers
          erforderlich.
        </p>
      </div>

      <div className="legal-meta">
        Stand: März 2026 · Michael Clas · UpMaDo · <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>
      </div>
    </LegalLayout>
  );
}
