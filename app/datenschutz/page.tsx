import type { Metadata } from "next";
import LegalLayout from "../components/LegalLayout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – UpMaDo",
};

export default function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">

      <div className="legal-section">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der DSGVO ist:<br />
          Michael Clas · UpMaDo<br />
          Plaidter Str. 31 · 56648 Saffig · Deutschland<br />
          E-Mail: <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Verarbeitete personenbezogene Daten</h2>

        <h2>2.1 Audio-Dateien</h2>
        <p>
          Hochgeladene Audiodateien werden ausschließlich im RAM verarbeitet und nach Abschluss
          sofort gelöscht (max. 10 Minuten). Keine dauerhafte Speicherung, keine Weitergabe, keine
          Analyse der Audioinhalte. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>

        <h2>2.2 Nutzungsdaten (Fair-Use)</h2>
        <p>
          Zur Durchsetzung etwaiger Nutzungslimits können anonymisierte Zähler gespeichert werden.
          Keine Nutzung für andere Zwecke. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse).
        </p>

        <h2>2.3 Server-Logs</h2>
        <p>
          Automatisch protokolliert: IP-Adresse, Datum/Uhrzeit, URL, HTTP-Status, Datenmenge.
          Speicherdauer: 7 Tage, dann automatische Löschung.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse — Betriebssicherheit).
        </p>
      </div>

      <div className="legal-section">
        <h2>3. Lokaler Speicher (LocalStorage)</h2>
        <p>
          Diese Website verwendet ausschließlich technisch notwendigen lokalen Speicher.
          Keine Tracking-Cookies, keine Werbe-Cookies, kein Analytics. Gespeichert werden:
        </p>
        <ul>
          <li>Benutzereinstellungen (Plattform, Preset, Intensity) — nur lokal, kein Upload</li>
          <li>Hinweis-Status (Cookie-Banner-Bestätigung)</li>
        </ul>
        <p>
          Die technisch notwendige Speicherung bedarf keiner Einwilligung
          (§ 25 Abs. 2 Nr. 2 TDDDG). Alle lokalen Daten verbleiben auf Ihrem Gerät.
        </p>
      </div>

      <div className="legal-section">
        <h2>4. Zahlungsabwicklung</h2>
        <p>
          Zahlungen (sofern angeboten) werden über externe Zahlungsdienstleister abgewickelt.
          UpMaDo speichert keinerlei Zahlungsmittel (Kartennummern, Bankdaten).
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Keine Weitergabe an Dritte</h2>
        <p>
          Personenbezogene Daten werden nicht an Dritte weitergegeben, verkauft oder vermietet —
          ausschließlich an notwendige Auftragsverarbeiter zur Erbringung ihrer jeweiligen Dienste.
          Kein Datenaustausch zu Werbezwecken.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Ihre Rechte (Art. 15–22 DSGVO)</h2>
        <ul>
          <li><strong>Auskunft</strong> (Art. 15) — Welche Daten wir verarbeiten</li>
          <li><strong>Berichtigung</strong> (Art. 16) — Korrektur unrichtiger Daten</li>
          <li><strong>Löschung</strong> (Art. 17) — „Recht auf Vergessenwerden"</li>
          <li><strong>Einschränkung</strong> (Art. 18) — Einschränkung der Verarbeitung</li>
          <li><strong>Datenübertragbarkeit</strong> (Art. 20) — Export in maschinenlesbarem Format</li>
          <li><strong>Widerspruch</strong> (Art. 21) — Gegen Verarbeitung auf Basis berechtigter Interessen</li>
        </ul>
        <p>
          Anfragen an: <a href="mailto:info@re-beatz.com">info@re-beatz.com</a><br />
          Beschwerden an: Landesbeauftragter für Datenschutz und Informationsfreiheit Rheinland-Pfalz
          (<a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer">datenschutz.rlp.de</a>)
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Keine automatisierte Entscheidungsfindung</h2>
        <p>
          Eine automatisierte Entscheidungsfindung oder Profiling im Sinne des Art. 22 DSGVO findet
          nicht statt. Der Mastering-Dienst verarbeitet Audiodateien rein technisch und trifft keine
          Entscheidungen mit rechtlicher oder ähnlich bedeutsamer Wirkung auf betroffene Personen.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Datensicherheit & Speicherdauer</h2>
        <p>
          Alle Übertragungen sind durch TLS/HTTPS verschlüsselt.
        </p>
        <ul>
          <li>Audio-Dateien: sofortige Löschung (max. 10 Min.)</li>
          <li>Server-Logs: 7 Tage</li>
          <li>Abrechnungsdaten (falls vorhanden): 10 Jahre (§ 147 AO)</li>
        </ul>
      </div>

      <div className="legal-meta">
        Stand: März 2026 · Michael Clas · UpMaDo · <a href="mailto:info@re-beatz.com">info@re-beatz.com</a>
      </div>
    </LegalLayout>
  );
}
