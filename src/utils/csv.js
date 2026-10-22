import fs from 'fs';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';

export async function filterCsv(inputFile, outputFile, minAge, cityFilter) {
  try {
    await fs.promises.access(inputFile, fs.constants.R_OK);
  } catch {
    throw new Error(`Входной файл не найден или недоступен: ${inputFile}`);
  }

  const parser = fs
    .createReadStream(inputFile)
    .pipe(parse({ bom: true, relax_column_count: true }));

  const iterator = parser[Symbol.asyncIterator]();

  const first = await iterator.next();
  if (first.done) throw new Error('Входной файл пуст.');

  const header = first.value;
  const ageIdx = header.indexOf('age');
  const cityIdx = header.indexOf('city');
  
  if (ageIdx === -1 || cityIdx === -1) {
    throw new Error('В CSV файле должны быть столбцы "age" и "city".');
  }

  const output = fs.createWriteStream(outputFile);
  const stringifier = stringify({ columns: header });
  stringifier.pipe(output);
  stringifier.write(header);

  let processed = 0;
  let passed = 0;

  try {
    for await (const record of iterator) {
      processed++;
      const rawAge = (record[ageIdx] ?? '').toString().trim();
      const age = rawAge === '' ? NaN : Number(rawAge);
      const city = (record[cityIdx] ?? '').toString().trim();

      if (Number.isFinite(age) && age >= minAge && city.toLowerCase() === cityFilter.toLowerCase()) {
        passed++;
        if (!stringifier.write(record)) {
          await new Promise((res, rej) => {
            stringifier.once('drain', res);
            stringifier.once('error', rej);
          });
        }
      }
    }
  } finally {
    stringifier.end();
    await new Promise((res, rej) => {
      output.once('finish', res);
      output.once('error', rej);
    });
  }

  return { processed, passed };
}