// Core scoring function
function calculateScore(duration, wakeups, caffeine, screen) {
  let score = 100;
  let breakdown = [];

  // Sleep duration scoring
  if (!duration) {
    breakdown.push("Sleep Duration: no entry yet");
  } else if (duration < 6) {
    score -= 30;
    breakdown.push("Sleep Duration: -30 (less than 6 hours)");
  } else if (duration < 8) {
    score -= 10;
    breakdown.push("Sleep Duration: -10 (between 6–7 hours)");
  } else if (duration > 9) {
    score -= 10;
    breakdown.push("Sleep Duration: -10 (more than 9 hours)");
  } else {
    breakdown.push("Sleep Duration: +0 (ideal 7–9 hours)");
  }

  // Wake-ups scoring
  let wakeupPenalty = wakeups * 5;
  score -= wakeupPenalty;
  breakdown.push(`Night Wake-ups: -${wakeupPenalty}`);

  // Caffeine scoring
  let caffeinePenalty = caffeine * 10;
  score -= caffeinePenalty;
  breakdown.push(`Caffeine Intake: -${caffeinePenalty}`);

  // Screen time scoring
  let screenPenalty = screen * 10;
  score -= screenPenalty;
  breakdown.push(`Screen Time Before Bed: -${screenPenalty}`);

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let quality;
  if (score >= 80) quality = "Excellent";
  else if (score >= 60) quality = "Good";
  else if (score >= 40) quality = "Fair";
  else quality = "Poor";

  return { score, quality, breakdown };
}

// Individual Portal live scoring
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sleepForm");
  if (form) {
    ["duration","wakeups","caffeine","screen"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => {
        const duration = parseInt(document.getElementById("duration").value) || 0;
        const wakeups = parseInt(document.getElementById("wakeups").value) || 0;
        const caffeine = parseInt(document.getElementById("caffeine").value) || 0;
        const screen = parseInt(document.getElementById("screen").value) || 0;

        const result = calculateScore(duration, wakeups, caffeine, screen);

        document.getElementById("result").innerHTML = `
          <h3>Sleep Quality Score: ${result.score}/100</h3>
          <p>Overall Sleep Quality: <strong>${result.quality}</strong></p>
          <div class="score-breakdown">
            <h4>Score Breakdown:</h4>
            <ul>${result.breakdown.map(item => `<li>${item}</li>`).join("")}</ul>
          </div>
        `;

        // Save record for reports
        const records = JSON.parse(localStorage.getItem("sleepRecords")) || [];
        records.push({
          date: new Date().toLocaleDateString(),
          score: result.score
        });
        localStorage.setItem("sleepRecords", JSON.stringify(records));
      });
    });
  }

  // Family Portal scoring
  const familyForm = document.getElementById("familyForm");
  if (familyForm) {
    familyForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("memberName").value;
      const duration = parseInt(document.getElementById("duration").value) || 0;
      const wakeups = parseInt(document.getElementById("wakeups").value) || 0;
      const caffeine = parseInt(document.getElementById("caffeine").value) || 0;
      const screen = parseInt(document.getElementById("screen").value) || 0;

      const result = calculateScore(duration, wakeups, caffeine, screen);

      const output = document.getElementById("familyResults");
      output.innerHTML += `
        <div class="info">
          <h4>${name}'s Sleep Report</h4>
          <p>Score: ${result.score}/100 — ${result.quality}</p>
          <ul>${result.breakdown.map(item => `<li>${item}</li>`).join("")}</ul>
        </div>
      `;

      // Save record for reports
      const records = JSON.parse(localStorage.getItem("sleepRecords")) || [];
      records.push({
        date: new Date().toLocaleDateString(),
        member: name,
        score: result.score
      });
      localStorage.setItem("sleepRecords", JSON.stringify(records));

      familyForm.reset();
    });
  }

  // Reports page chart
  const chartCanvas = document.getElementById("sleepChart");
  if (chartCanvas) {
    const records = JSON.parse(localStorage.getItem("sleepRecords")) || [];
    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: records.map(r => r.date + (r.member ? ` (${r.member})` : "")),
        datasets: [{
          label: "Sleep Quality Score",
          data: records.map(r => r.score),
          borderColor: "#1e3c72",
          backgroundColor: "rgba(30,60,114,0.1)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }
  
});
["duration","wakeups","caffeine","screen"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    const duration = parseInt(document.getElementById("duration").value) || 0;
    const wakeups = parseInt(document.getElementById("wakeups").value) || 0;
    const caffeine = parseInt(document.getElementById("caffeine").value) || 0;
    const screen = parseInt(document.getElementById("screen").value) || 0;

    const result = calculateScore(duration, wakeups, caffeine, screen);

    document.getElementById("result").className = "tile";
    document.getElementById("result").innerHTML = `
      <h4>Your Sleep Report</h4>
      <p>Score: ${result.score}/100 — ${result.quality}</p>
      <ul>${result.breakdown.map(item => `<li>${item}</li>`).join("")}</ul>
    `;
  });
});
familyForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const duration = parseInt(document.getElementById("duration").value) || 0;
  const wakeups = parseInt(document.getElementById("wakeups").value) || 0;
  const caffeine = parseInt(document.getElementById("caffeine").value) || 0;
  const screen = parseInt(document.getElementById("screen").value) || 0;

  const result = calculateScore(duration, wakeups, caffeine, screen);

  const tile = document.createElement("div");
  tile.className = "tile";
  tile.innerHTML = `
    <h4>${name}'s Sleep Report</h4>
    <p>Score: ${result.score}/100 — ${result.quality}</p>
    <ul>${result.breakdown.map(item => `<li>${item}</li>`).join("")}</ul>
  `;
  document.getElementById("familyResults").appendChild(tile);

  familyForm.reset();
});
