// Reference — Waymark core task (Approach A: LINQ)
using System.Globalization;

const string path = "postal_codes_eng_lat_lon.csv";
const int PlaceCode = 3, Lat = 18, Lon = 19, MinCols = 20;

static bool TryCoord(string? s, out double value) =>
    double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out value);

if (!File.Exists(path))
{
    Console.WriteLine($"File not found: {Path.GetFullPath(path)}");
    return;
}

Console.WriteLine("=== Waymark Core Count (LINQ) ===");

var rows = File.ReadLines(path)
    .Where(l => !string.IsNullOrWhiteSpace(l))
    .Select(l => l.Split(';'))
    .Where(c => c.Length >= MinCols && !c[0].Equals("id", StringComparison.OrdinalIgnoreCase))
    .Select(c => new
    {
        Code = c[PlaceCode].Trim(),
        Ok = TryCoord(c[Lat], out _) && TryCoord(c[Lon], out _),
    })
    .Where(x => !string.IsNullOrWhiteSpace(x.Code) && x.Ok)
    .GroupBy(x => x.Code, StringComparer.OrdinalIgnoreCase)
    .OrderBy(g => g.Key, StringComparer.OrdinalIgnoreCase);

var results = rows.ToList();
Console.WriteLine($"Distinct postal codes: {results.Count}");

foreach (var g in results)
    Console.WriteLine($"{g.Key}, {g.Count()}");

Console.WriteLine($"Total valid locations: {results.Sum(g => g.Count())}");
