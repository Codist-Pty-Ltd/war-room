/** Shared column map for waymark_dotnet_challenge (semicolon-delimited CSV). */
export const WAYMARK_CSV_FILENAME = "postal_codes_eng_lat_lon.csv";

export const WAYMARK_CSV_COLUMNS = {
  id: 0,
  parent: 1,
  placeType: 2,
  placeCode: 3,
  codeType: 4,
  eng: 5,
  streetCode: 16,
  boxCode: 17,
  latitude: 18,
  longitude: 19,
  lastModified: 20,
} as const;

export const WAYMARK_MIN_COLS = 20;

export const WAYMARK_COLUMN_REFERENCE = `Semicolon-delimited CSV (NOT comma). Header row present. 21 columns (index 0–20):
| Index | Name | Example |
|------:|------|---------|
| 0 | id | 100001 |
| 1 | parent | 101353 |
| 2 | place_type | town, local_municipality |
| 3 | place_code | KZN263, DC44 |
| 4 | code_type | municipal_code or empty |
| 5 | eng | Aberdeen |
| 16 | street_code | 6270 |
| 17 | box_code | 6270 |
| 18 | latitude | -27.8471729 |
| 19 | longitude | 30.8059392 |
| 20 | last_modified | 2024/03/27 07:03 |

59 data rows. One corrupted row (id 100055): empty place_code, invalid place_type, bad coordinates.`;

export const WAYMARK_KNOWN_COUNTS: Record<string, number> = {
  KZN263: 7,
  LIM352: 4,
  MP301: 5,
  DC44: 5,
  LIM334: 7,
};
