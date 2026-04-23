// Calls the Backend and Passes in The Files

import { getDashboard } from "./dashboard";
import { generateReports } from "./documents";
import { getInsights } from "./insights";
import { getPricing } from "./pricing";

const ENDPOINT = 8000;

export async function uploadInitDocuments(
  descriptionFile,
  inventoryFile,
  salesFile,
  balanceFile,
) {
  console.log("Uploading Init Documents");

  const formData = new FormData();
  formData.append("description_file", descriptionFile);
  formData.append("inventory_sheet", inventoryFile);
  formData.append("sales_sheet", salesFile);
  formData.append("balance_sheet", balanceFile);

  const res = await fetch(`http://localhost:${ENDPOINT}/initialise_data`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  console.log("Result from backend is ", data);
}

export async function init(
  descriptionFile,
  inventoryFile,
  salesFile,
  balanceFile,
  onStep,
) {
  onStep(0); // "Reading your documents"
  await uploadInitDocuments(
    descriptionFile,
    inventoryFile,
    salesFile,
    balanceFile,
  );

  onStep(1); // "Scanning market trends"
  await getInsights();

  onStep(2); // "Analysing your inventory"
  await getPricing();

  onStep(3); // "Generating recommendations"
  await generateReports();

  onStep(4); // "Building your dashboard"
  await getDashboard();
}
