import type { Metadata } from "next";
import LegalLayout from "../components/LegalLayout";

export const metadata: Metadata = {
  title: "AGB – UpMaDo",
  description: "Allgemeine Geschäftsbedingungen des automatisierten Audio-Mastering-Dienstes UpMaDo.",
};

const SECTIONS = [
  { id: "geltungsbereich",   label: "§ 1 Geltungsbereich" },
  { id: "leistung",          label: "§ 2 Leistungsbeschreibung" },
  { id: "konto",             label: "§ 3 Nutzerkonto" },
  { id: "preise",            label: "§ 4 Preise & Zahlung" },
  { id: "widerruf",          label: "§ 5 Widerrufsrecht" },
  { id: "kuendigung",        label: "§ 6 Kündigung" },
  { id: "urheberrecht",      label: "§ 7 Urheberrecht" },
  { id: "datenschutz",       label: "§ 8 Datenschutz" },
  { id: "haftung",           label: "§ 9 Haftung" },
  { id: "recht",             label: "§ 10 Geltendes Recht" },
  { id: "schluss",           label: "§ 11 Schlussbestimmungen" },
];

export default function AGBPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen" activePage="agb" sections={SECTIONS}>

      <div className="legal-section" id="geltungsbereich">
        <h2>§ 1 Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
          Michael Clas, UpMaDo, Plaidter Str. 31, 56648 Saffig (nachfolgend „Anbieter") und den
          Nutzern des Online-Mastering-Dienstes unter upmado.com (nachfolgend „Nutzer"). Mit der
          Registrierung, dem Kauf eines Einzeltracks oder der Nutzung des kostenlosen Dienstes
          stimmt der Nutzer diesen AGB zu. Entgegenstehende oder abweichende Bedingungen des
          Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
          ausdrücklich schriftlich zu.
        </p>
      </div>

      <div className="legal-section" id="leistung">
        <h2>§ 2 Leistungsbeschreibung</h2>
        <p>
          UpMaDo bietet einen automatisierten Audio-Mastering-Dienst an. Der Dienst umfasst die
          Verarbeitung von Audiodateien durch eine mehrstufige DSP-Signalkette (u. a. EQ,
          Mehrband-Kompression, Stereo-Optimierung, Sättigung, LUFS-Normalisierung,
          True-Peak-Limiting) sowie die zeitlich befristete Bereitstellung von Download-Formaten.
          Der Anbieter stellt die gemasterte Ausgabedatei für einen Zeitraum von
          <strong style={{ color: "var(--text-primary)" }}> 2 Stunden</strong> nach Abschluss der
          Verarbeitung zum Download bereit. Nach Ablauf dieser Frist wird die Datei automatisch
          und unwiederbringlich vom Server gelöscht.
        </p>
        <p>
          Der Dienst wird in folgenden Tarifen angeboten:
        </p>
        <ul>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Free (€ 0 / Monat):</strong>{" "}
            DSP-Mastering-Signalkette, Download als MP3 128 kbps, bis zu 3 Masters pro Tag.
            Kein KI-Mastering.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Pay per Track (€ 1,99 / Track):</strong>{" "}
            Vollständige DSP-Kette ohne KI-Parameterauswahl. Alle Formate (WAV 24-bit,
            WAV 16-bit, FLAC, MP3 320, MP3 128, AAC 256). Download-Fenster 2 Stunden.
            Keine Registrierung erforderlich.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Creator (€ 7,99 / Monat):</strong>{" "}
            DSP-Mastering inkl. KI-gestützter Parameterauswahl (Claude AI), 25 Masters pro Monat,
            alle Formate, Mastering-Verlauf (Metadaten). Download-Fenster 2 Stunden.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Pro (€ 14,99 / Monat):</strong>{" "}
            Wie Creator, zusätzlich Referenz-Track-Mastering, 100 Masters pro Monat,
            Mastering-Verlauf (Metadaten). Download-Fenster 2 Stunden.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Pro+ (€ 24,99 / Monat):</strong>{" "}
            Wie Pro, zusätzlich WAV 32-bit Float, Prioritäts-Processing, 250 Masters pro Monat.
            Download-Fenster 2 Stunden.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Studio (€ 49,99 / Monat):</strong>{" "}
            Unlimitierte Masters, KI-Parameterauswahl, API-Zugang, Stems-Mastering,
            White-Label Mastering-Report (PDF), Prioritäts-Processing, bis zu 3 Team-Seats.
            Download-Fenster 2 Stunden.
          </li>
        </ul>
        <p>
          Bei Jahresabonnements werden die Monatsbeiträge um ca. 30 % reduziert (Äquivalent von
          3 Monaten kostenfrei). Der Anbieter behält sich vor, den Dienst jederzeit zu ändern,
          zu erweitern oder einzustellen, sofern dies dem Nutzer mit angemessener Frist mitgeteilt
          wird.
        </p>
      </div>

      <div className="legal-section" id="konto">
        <h2>§ 3 Nutzerkonto</h2>
        <p>
          Die Nutzung des kostenpflichtigen Abonnements setzt eine Registrierung voraus. Der
          Nutzer ist verpflichtet, wahrheitsgemäße und vollständige Angaben zu machen und diese
          aktuell zu halten. Die Zugangsdaten sind vertraulich zu behandeln und vor unbefugtem
          Zugriff zu schützen. Der Nutzer haftet für alle Aktivitäten, die unter seinem Konto
          stattfinden, sofern er den Missbrauch nicht zu vertreten hat.
        </p>
        <p>
          Gemasterte Audiodateien werden nicht dauerhaft im Nutzerkonto gespeichert (→ § 8). Im
          Nutzerkonto werden ausschließlich Metadaten des Mastering-Verlaufs gespeichert:
          Dateiname, Erstellungsdatum, gewählte Plattform, LUFS-Messwerte und
          KI-Mastering-Parameter. Die Originalaudio- und Ausgabedateien selbst werden nach
          Ablauf des 2-Stunden-Fensters vom Server gelöscht.
        </p>
        <p>
          Der Anbieter behält sich vor, Konten bei schwerwiegenden oder wiederholten Verstößen
          gegen diese AGB zu sperren oder zu löschen.
        </p>
      </div>

      <div className="legal-section" id="preise">
        <h2>§ 4 Preise und Zahlung</h2>
        <p>
          Die aktuellen Preise sind auf der Preisseite unter{" "}
          <a href="/pricing">upmado.com/pricing</a> einsehbar. Alle Preise verstehen sich
          inklusive der gesetzlichen Mehrwertsteuer (19 % MwSt.). Die Abrechnung von
          Abonnements erfolgt im Voraus für den jeweiligen Abrechnungszeitraum (monatlich
          oder jährlich). Pay-per-Track-Käufe werden einmalig abgerechnet.
        </p>
        <p>
          Die Zahlungsabwicklung erfolgt über PayPal (Europe) S.à r.l. et Cie, S.C.A.,
          22–24 Boulevard Royal, L-2449 Luxemburg. UpMaDo speichert keine Zahlungsmittel
          (Karten- oder Bankdaten). Mangels ausdrücklicher anderweitiger Vereinbarung
          verlängert sich ein Abonnement automatisch um den jeweils gewählten Zeitraum,
          wenn es nicht rechtzeitig vor Ablauf gekündigt wird.
        </p>
      </div>

      <div className="legal-section" id="widerruf">
        <h2>§ 5 Widerrufsrecht</h2>
        <p>
          Das Widerrufsrecht richtet sich nach dem gewählten Tarif:
        </p>
        <ul>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Free-Tarif:</strong>{" "}
            Kein entgeltlicher Vertrag; das Widerrufsrecht ist nicht anwendbar.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Pay per Track:</strong>{" "}
            Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss
            zu. Das Widerrufsrecht erlischt vorzeitig gemäß § 356 Abs. 5 BGB, wenn der Nutzer
            vor dem Kauf ausdrücklich bestätigt hat, dass er mit der sofortigen Ausführung der
            digitalen Dienstleistung einverstanden ist, und seine Kenntnis davon bestätigt hat,
            dass er durch die Zustimmung zur sofortigen Ausführung sein Widerrufsrecht verliert.
          </li>
          <li>
            <strong style={{ color: "var(--text-primary)" }}>Abonnements (Creator, Pro, Pro+, Studio):</strong>{" "}
            Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen ab Vertragsschluss
            zu. Die vollständige Widerrufsbelehrung und das Muster-Widerrufsformular finden Sie
            unter <a href="/widerruf">upmado.com/widerruf</a>. Auch bei Abonnements erlischt
            das Widerrufsrecht vorzeitig, wenn der Dienst auf ausdrücklichen Wunsch des
            Verbrauchers sofort begonnen und die Kenntnis des Rechteverlusts bestätigt wurde.
          </li>
        </ul>
      </div>

      <div className="legal-section" id="kuendigung">
        <h2>§ 6 Kündigung</h2>
        <p>
          Der Nutzer kann sein Abonnement jederzeit zum Ende des laufenden Abrechnungszeitraums
          kündigen. Nach der Kündigung bleibt der Zugang bis zum Ende des bezahlten Zeitraums
          erhalten. Eine außerordentliche Kündigung durch den Anbieter ist bei schwerwiegenden
          Verstößen gegen diese AGB fristlos möglich. Für Pay-per-Track-Käufe besteht kein
          laufendes Vertragsverhältnis.
        </p>
      </div>

      <div className="legal-section" id="urheberrecht">
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

      <div className="legal-section" id="datenschutz">
        <h2>§ 8 Datenschutz und Datenspeicherung</h2>
        <p>
          Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </p>
        <p>
          Hochgeladene Original-Audiodateien werden unmittelbar nach Abschluss der Verarbeitung
          vom Server gelöscht (maximal 60 Minuten). Gemasterte Ausgabedateien stehen
          <strong style={{ color: "var(--text-primary)" }}> 2 Stunden</strong> nach Verarbeitungsabschluss
          zum Download bereit und werden anschließend automatisch gelöscht. Es wird keine
          permanente Audio-Bibliothek oder dauerhaftes Dateiarchiv geführt. Im Nutzerkonto
          werden ausschließlich Mastering-Metadaten (Dateiname, Datum, Parameter,
          Analyseergebnisse) gespeichert, kein Audiomaterial.
        </p>
      </div>

      <div className="legal-section" id="haftung">
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
          Gewähr für ein bestimmtes künstlerisches Ergebnis übernommen. Nutzer sind ausdrücklich
          darauf hingewiesen, dass gemasterte Dateien innerhalb des 2-Stunden-Fensters
          heruntergeladen werden müssen.
        </p>
      </div>

      <div className="legal-section" id="recht">
        <h2>§ 10 Geltendes Recht und Gerichtsstand</h2>
        <p>
          Es gilt ausschließlich das Recht der Bundesrepublik Deutschland unter Ausschluss des
          UN-Kaufrechts (CISG). Als Gerichtsstand wird — soweit gesetzlich zulässig — Koblenz
          vereinbart. Für Verbraucher gilt abweichend das Recht des Mitgliedstaates der
          Europäischen Union, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, sofern
          es sich um zwingende Verbraucherschutzvorschriften handelt.
        </p>
      </div>

      <div className="legal-section" id="schluss">
        <h2>§ 11 Schlussbestimmungen</h2>
        <p>
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
          Wirksamkeit der übrigen Bestimmungen davon unberührt. Der Anbieter behält sich das
          Recht vor, diese AGB mit angemessener Frist (mindestens 30 Tage) zu ändern.
          Änderungen werden dem Nutzer per E-Mail mitgeteilt. Widerspricht der Nutzer nicht
          innerhalb der Frist, gelten die neuen AGB als akzeptiert. Ausgenommen von dieser
          Zustimmungsfiktion sind Preiserhöhungen sowie wesentliche Einschränkungen der
          vertraglich vereinbarten Leistungen; für diese ist stets die ausdrückliche
          gesonderte Zustimmung des Nutzers erforderlich.
        </p>
      </div>

      <div className="legal-meta">
        Stand: März 2026 · Michael Clas · UpMaDo · <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>
      </div>
    </LegalLayout>
  );
}
