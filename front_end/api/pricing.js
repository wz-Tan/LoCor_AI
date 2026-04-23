// Fetches Data from Backend to Map onto Javascript
const ENDPOINT = 8000;

let generated_pricing = null;

export async function acquirePricing() {
  console.log("Generating Pricing Comparison");

  const res = await fetch(`http://localhost:${ENDPOINT}/generate_pricing`, {
    method: "GET",
  });

  const data = await res.json();
  console.log("Pricing generated are", data);
  return data.generated_pricing;
}

export async function getPricing() {
  if (!generated_pricing) {
    generated_pricing = await acquirePricing();
  }

  return generated_pricing;
}
