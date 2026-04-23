const ENDPOINT = 8000;
let generated_dashboard = null;

export async function acquireDashboard() {
  console.log("Generating Dashboard");
  const res = await fetch(`http://localhost:${ENDPOINT}/generate_dashboard`, {
    method: "GET",
  });
  const data = await res.json();
  console.log("Dashboard data is", data);
  return data.generated_dashboard;
}

export async function getDashboard() {
  if (!generated_dashboard) {
    generated_dashboard = await acquireDashboard();
  }
  return generated_dashboard;
}
