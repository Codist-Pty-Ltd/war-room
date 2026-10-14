// Reference — Waymark core task (Approach B: Dictionary)
using System.Globalization;

const string path = "postal_codes_eng_lat_lon.csv";
const int PlaceCode = 3, Eng = 5, Box = 17, Lat = 18, Lon = 19, MinCols = 20;

static bool TryCoord(string? s, out double value) =>
    double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out value);

if (!File.Exists(path))
{
    Console.WriteLine($"File not found: {Path.GetFullPath(path)}");
    return;
}

Console.WriteLine("=== Waymark Core Count (Dictionary) ===");

var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
var skipped = 0;

foreach (var line in File.ReadLines(path))
{
    if (string.IsNullOrWhiteSpace(line)) continue;
    var cols = line.Split(';');
    if (cols.Length < MinCols) { skipped++; continue; }
    if (cols[0].Equals("id", StringComparison.OrdinalIgnoreCase)) continue;

    var code = cols[PlaceCode].Trim();
    if (string.IsNullOrWhiteSpace(code)) { skipped++; continue; }

    _ = cols[Eng].Trim();
    _ = cols[Box].Trim();
    if (!TryCoord(cols[Lat], out _)) { skipped++; continue; }
    if (!TryCoord(cols[Lon], out _)) { skipped++; continue; }

    counts[code] = counts.GetValueOrDefault(code) + 1;
}

foreach (var code in counts.Keys.OrderBy(k => k, StringComparer.OrdinalIgnoreCase))
    Console.WriteLine($"{code}, {counts[code]}");

Console.WriteLine($"\nSkipped: {skipped}");
Console.WriteLine($"Total valid locations: {counts.Values.Sum()}");
