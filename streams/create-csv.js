import { parse } from "csv-parse";
import fs from "node:fs";

const csvFile = new URL("./tasks.csv", import.meta.url);

const stream = fs.createReadStream(csvFile);

const parseCsvFile = parse({
  delimiter: ",",
  skipEmptyLines: true,
  fromLine: 2,
});

async function runImportCsv() {
  const rowsParse = stream.pipe(parseCsvFile);

  for await (const row of rowsParse) {
    const [title, description] = row;

    try {
      await fetch("http://localhost:3333/tasks/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      console.log("Row imported successfully:", title, description);
    } catch (error) {
      console.error("Error importing row:", error);
    }
  }
}

runImportCsv().catch(console.error);
