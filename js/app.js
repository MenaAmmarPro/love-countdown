"use strict";

/*
 * love-countdown — a private little clock for Mena.
 * Everything is stored in this browser only (localStorage). No tracking,
 * no network calls beyond loading the page itself.
 */

(function () {
  const STORE = {
    date: "mena-countdown-date",
    name: "mena-countdown-name",
    reminder: "mena-countdown-reminder",
    lastNotify: "mena-countdown-last-notify"
  };

  const MILESTONES = [
    { days: 1, label: "First day together" },
    { days: 7, label: "One week" },
    { days: 30, label: "One month" },
    { days: 100, label: "One hundred days" },
    { days: 200, label: "Two hundred days" },
    { days: 365, label: "One whole year" },
    { days: 500, label: "Five hundred days" },
    { days: 730, label: "Two years" },
    { days: 1000, label: "One thousand days" },
    { days: 1095, label: "Three years" },
    { days: 1461, label: "Four years" },
    { days: 1826, label: "Five years" }
  ];

  const RING_CIRCUMFERENCE = 2 * Math.PI * 94;

  function read(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — the page still works this visit */
    }
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value + "T00:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function toInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const els = {
      heroName: document.getElementById("hero-name"),
      sinceLine: document.getElementById("since-line"),
      days: document.getElementById("stat-days"),
      hours: document.getElementById("stat-hours"),
      minutes: document.getElementById("stat-minutes"),
      seconds: document.getElementById("stat-seconds"),
      ringWrap: document.querySelector(".ring-wrap"),
      ring: document.getElementById("ring-progress"),
      countdownDays: document.getElementById("countdown-days"),
      countdownLabel: document.getElementById("countdown-label"),
      countdownDate: document.getElementById("countdown-date"),
      milestones: document.getElementById("milestones"),
      dateInput: document.getElementById("anniversary-input"),
      nameInput: document.getElementById("name-input"),
      saveButton: document.getElementById("save-settings"),
      saveNote: document.getElementById("save-note"),
      calendarButton: document.getElementById("add-calendar"),
      calendarLink: document.getElementById("add-calendar-link"),
      shareButton: document.getElementById("share-button"),
      installButton: document.getElementById("install-button"),
      enableNotifications: document.getElementById("enable-notifications"),
      disableNotifications: document.getElementById("disable-notifications"),
      notifyStatus: document.getElementById("notify-status")
    };

    let anniversary = parseDate(read(STORE.date, ""));
    let name = read(STORE.name, "Mena") || "Mena";

    els.nameInput.value = name === "Mena" ? "" : name;
    els.dateInput.value = anniversary ? toInputValue(anniversary) : "";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const formatNum = (n) => n.toLocaleString("en-US");
    const pad = (n) => String(n).padStart(2, "0");
    let counted = false;

    function showEmpty() {
      els.days.textContent = "—";
      els.hours.textContent = "—";
      els.minutes.textContent = "—";
      els.seconds.textContent = "—";
      els.sinceLine.textContent =
        "Set the day we started below and the counting begins.";
      els.countdownDays.textContent = "—";
      els.countdownLabel.textContent = "set our date";
      els.countdownDate.textContent = "";
      els.milestones.innerHTML = "";
      setRing(0);
    }

    function setRing(progress) {
      const clamped = Math.max(0, Math.min(1, progress));
      const offset = RING_CIRCUMFERENCE * (1 - clamped);
      els.ring.style.strokeDashoffset = String(offset);
    }

    function nextAnniversary(now) {
      const start = anniversary;
      let next = new Date(now.getFullYear(), start.getMonth(), start.getDate());
      if (next.getFullYear() < start.getFullYear()) {
        next.setFullYear(start.getFullYear());
      }
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let guard = 0;
      while (next < today && guard < 50) {
        next.setFullYear(next.getFullYear() + 1);
        guard += 1;
      }
      return next;
    }

    function renderRing(now, totalDays) {
      const next = nextAnniversary(now);
      const previous = new Date(next.getFullYear() - 1, next.getMonth(), next.getDate());

      const span = next - previous;
      const progress = span > 0 ? (now - previous) / span : 0;
      setRing(progress);

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((next - today) / 86400000);
      const isAnniversary = diffDays === 0;

      els.ringWrap.classList.toggle("is-anniversary", isAnniversary);

      if (isAnniversary) {
        const years = next.getFullYear() - anniversary.getFullYear();
        els.countdownDays.textContent = "Today";
        els.countdownLabel.textContent =
          years === 1 ? "one beautiful year" : years + " beautiful years";
      } else {
        els.countdownDays.textContent = String(diffDays);
        els.countdownLabel.textContent =
          diffDays === 1 ? "day to go" : "days to go";
      }

      els.countdownDate.textContent = next.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });

      return totalDays;
    }

    function renderMilestones(totalDays) {
      els.milestones.innerHTML = "";

      const list = MILESTONES.map((m) => ({
        ...m,
        reached: totalDays >= m.days,
        remaining: m.days - totalDays
      }));

      const upcoming = list.find((m) => !m.reached);
      const visible = list.filter(
        (m) => m.reached || (upcoming && m.days <= upcoming.days + 736)
      );

      const show = visible.length ? visible : list;

      show.forEach((m) => {
        const li = document.createElement("li");
        li.className = "milestone" + (m.reached ? " reached" : "");

        const mark = document.createElement("span");
        mark.className = "milestone-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = m.reached ? "♥" : "✦";

        const body = document.createElement("span");
        body.className = "milestone-body";

        const title = document.createElement("span");
        title.className = "milestone-title";
        title.textContent = m.label;

        const when = document.createElement("span");
        when.className = "milestone-when";
        const date = new Date(
          anniversary.getTime() + m.days * 86400000
        );
        when.textContent = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });

        body.appendChild(title);
        body.appendChild(document.createElement("br"));
        body.appendChild(when);

        const status = document.createElement("span");
        status.className = "milestone-status";
        status.textContent = m.reached
          ? "reached"
          : m.remaining + (m.remaining === 1 ? " day" : " days");

        li.appendChild(mark);
        li.appendChild(body);
        li.appendChild(status);
        els.milestones.appendChild(li);
      });
    }

    function countUp(el, target) {
      const duration = 1200;
      const begin = performance.now();
      function step(now) {
        const progress = Math.min((now - begin) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatNum(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    function render() {
      if (!anniversary) {
        showEmpty();
        return;
      }

      const now = new Date();
      const elapsed = now - anniversary;

      if (elapsed < 0) {
        const until = Math.ceil(-elapsed / 86400000);
        els.days.textContent = "0";
        els.hours.textContent = "00";
        els.minutes.textContent = "00";
        els.seconds.textContent = "00";
        els.sinceLine.textContent =
          "Counting down to our beginning — " +
          until +
          (until === 1 ? " day" : " days") +
          " to go.";
        return;
      }

      const totalSeconds = Math.floor(elapsed / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor(totalSeconds / 3600) % 24;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const seconds = totalSeconds % 60;

      if (!counted) {
        counted = true;
        if (reduceMotion) {
          els.days.textContent = formatNum(days);
        } else {
          countUp(els.days, days);
        }
        els.sinceLine.textContent =
          "Since " +
          anniversary.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          }) +
          " — and still counting.";
        renderMilestones(days);
      }

      els.hours.textContent = pad(hours);
      els.minutes.textContent = pad(minutes);
      els.seconds.textContent = pad(seconds);

      renderRing(now, days);
    }

    function applyName(value) {
      const clean = (value || "").trim().slice(0, 40) || "Mena";
      name = clean;
      els.heroName.textContent = clean + ".";
      document.title = "Our Time ✦ Love for " + clean;
    }

    applyName(name);

    els.saveButton.addEventListener("click", () => {
      const parsed = parseDate(els.dateInput.value);
      if (!parsed) {
        els.saveNote.textContent = "Please pick a valid date first.";
        return;
      }
      anniversary = parsed;
      counted = false;
      write(STORE.date, els.dateInput.value);
      applyName(els.nameInput.value);
      write(STORE.name, name);
      els.saveNote.textContent = "Saved on this device. ♥";
      render();
      renderMilestones(Math.floor((Date.now() - anniversary) / 86400000));
    });

    /* ---- calendar file ---- */
    function downloadIcs() {
      if (!anniversary) {
        els.saveNote.textContent = "Set our date first, then add it to a calendar.";
        return;
      }
      const start = anniversary;
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, "0");
      const d = String(start.getDate()).padStart(2, "0");
      const stamp =
        new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Love for Mena//Our Time//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:our-anniversary-" + y + m + d + "@love-for-mena",
        "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + y + m + d,
        "SUMMARY:Our anniversary ♥",
        "DESCRIPTION:Our little anniversary — made with love.",
        "RRULE:FREQ=YEARLY",
        "BEGIN:VALARM",
        "TRIGGER:PT0S",
        "ACTION:DISPLAY",
        "DESCRIPTION:Our anniversary ♥",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
      ];

      const blob = new Blob([lines.join("\r\n")], {
        type: "text/calendar;charset=utf-8"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "our-anniversary.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      els.saveNote.textContent = "Our anniversary was saved as a calendar file. ♥";
    }

    els.calendarButton.addEventListener("click", downloadIcs);
    if (els.calendarLink) {
      els.calendarLink.addEventListener("click", (event) => {
        event.preventDefault();
        downloadIcs();
      });
    }

    /* ---- share ---- */
    if (els.shareButton) {
      els.shareButton.addEventListener("click", async () => {
        const url = window.location.href;
        const data = {
          title: "Our Time ✦ Love for " + name,
          text: "A little clock I made, just for you.",
          url
        };
        try {
          if (navigator.share) {
            await navigator.share(data);
          } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(url);
            els.saveNote.textContent = "Link copied. ♥";
          }
        } catch {
          /* the user cancelled the share sheet */
        }
      });
    }

    /* ---- install prompt ---- */
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (els.installButton) els.installButton.hidden = false;
    });

    if (els.installButton) {
      els.installButton.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        els.installButton.hidden = true;
      });
    }

    /* ---- daily reminder (works while a tab is open) ---- */
    function reminderEnabled() {
      return read(STORE.reminder, "") === "on";
    }

    function updateNotifyUi() {
      if (!els.notifyStatus) return;
      if (!("Notification" in window)) {
        els.notifyStatus.textContent =
          "This browser cannot show reminders — the calendar file still works.";
        return;
      }
      if (Notification.permission === "denied") {
        els.notifyStatus.textContent =
          "Reminders are blocked in your browser settings.";
        return;
      }
      els.notifyStatus.textContent = reminderEnabled()
        ? "Daily reminder is on. We will nudge you once a day while a tab is open."
        : "Daily reminder is off.";
    }

    function maybeNotify() {
      if (!reminderEnabled() || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      if (now.getHours() < 19) return;

      const today = toInputValue(now);
      if (read(STORE.lastNotify, "") === today) return;

      write(STORE.lastNotify, today);
      try {
        new Notification("A little reminder ♥", {
          body: "You are loved. Come see how long we have been counting.",
          icon: "assets/icons/icon-192.png"
        });
      } catch {
        /* notification failed silently */
      }
    }

    if (els.enableNotifications) {
      els.enableNotifications.addEventListener("click", async () => {
        if (!("Notification" in window)) {
          els.notifyStatus.textContent = "This browser cannot show reminders.";
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          write(STORE.reminder, "on");
        }
        updateNotifyUi();
      });
    }

    if (els.disableNotifications) {
      els.disableNotifications.addEventListener("click", () => {
        write(STORE.reminder, "off");
        updateNotifyUi();
      });
    }

    updateNotifyUi();
    window.setInterval(maybeNotify, 30000);

    /* ---- service worker ---- */
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }

    render();
    window.setInterval(render, 1000);
  });
})();
