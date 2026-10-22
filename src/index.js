import config from './config/index.js'; // Обязательно .js
import { filterCsv } from './utils/csv.js'; // Обязательно .js

async function main() {
  try {
    const stats = await filterCsv(config.inputFile, config.outputFile, config.minAge, config.city);

    console.log(`\n--- Готово ---`);
    console.log(`Обработано строк: ${stats.processed}`);
    console.log(`Прошло фильтр:  ${stats.passed}`);
    console.log(`Результат записан в: ${config.outputFile}`);
    
  } catch (error) {
    console.error(`Ошибка: ${error.message}`);
    process.exit(1);
  }
}

main();