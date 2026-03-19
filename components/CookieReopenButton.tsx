"use client";

export default function CookieReopenButton() {
  function reopen() {
    window.dispatchEvent(new Event("open-cookie-banner"));
  }

  return (
    <button
      onClick={reopen}
      style={{
        background: "none",
        border: "none",
        color: "inherit",
        fontSize: "inherit",
        cursor: "pointer",
        padding: 0,
        textDecoration: "none",
      }}
      className="hover:text-white transition-colors"
    >
      Cookie-Einstellungen
    </button>
  );
}
