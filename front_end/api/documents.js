// Fetches Data from Backend to Map onto Javascript
const ENDPOINT = 8000;

export async function generateReports() {
  console.log("Generating Documents to Be Newslettered");

  await fetch(`http://localhost:${ENDPOINT}/generate_reports`, {
    method: "GET",
  });

  return;
}
