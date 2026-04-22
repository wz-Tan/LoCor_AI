// Fetches Data from Backend to Map onto Javascript
const ENDPOINT = 8000;

export async function getInsights() {
  console.log("Generating Insights");

  const res = await fetch(`http://localhost:${ENDPOINT}/generate_insights`, {
    method: "GET",
  });
  
  const data = await res.json();
   console.log("Insights generated are", data);
  return data.generated_insights;
}
