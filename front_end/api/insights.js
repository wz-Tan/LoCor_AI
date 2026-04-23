// Fetches Data from Backend to Map onto Javascript
const ENDPOINT = 8000;

let generated_insights = null;

export async function acquireInsights() {
  console.log("Generating Insights");

  const res = await fetch(`http://localhost:${ENDPOINT}/generate_insights`, {
    method: "GET",
  });

  const data = await res.json();
  console.log("Insights generated are", data);
  return data.generated_insights;
}

export async function getInsights() {
  if (!generated_insights) {
    generated_insights = await acquireInsights();
  }

  return generated_insights;
}
