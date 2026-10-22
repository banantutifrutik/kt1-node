import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ищем .env в разных местах (в корне, в папке src, в папке data)
const possiblePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'src', '.env'),
  path.resolve(process.cwd(), 'data', '.env'),
  path.resolve(process.cwd(), 'src', 'data', '.env'),
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('\n  ВНИМАНИЕ: Файл .env не найден ни по одному из путей!');
} 

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    console.error(`\n Ошибка конфигурации: переменная ${name} не задана.`);
    console.error(` Проверь файл .env. В нем должна быть строка: ${name}=...`);
    process.exit(1);
  }
  return value.trim();
}

const minAgeRaw = requireEnv('MIN_AGE');
const minAge = Number(minAgeRaw);
if (!Number.isFinite(minAge)) {
  console.error(`Ошибка конфигурации: MIN_AGE="${minAgeRaw}" не является числом.`);
  process.exit(1);
}

export default {
  inputFile: requireEnv('INPUT_FILE'),
  outputFile: requireEnv('OUTPUT_FILE'),
  minAge: minAge,
  city: requireEnv('CITY_FILTER'),
};