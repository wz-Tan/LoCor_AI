// Calls the Backend and Passes in The Files

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
