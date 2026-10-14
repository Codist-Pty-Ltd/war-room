// Reference — Approach B: Postcode dictionary + stream-friendly loop
const string filePath = @"..\..\..\..\codings\invrstec_2.0\pp-monthly-update-new-version.csv";

if (!File.Exists(filePath))
{
    Console.WriteLine($"CSV not found: {Path.GetFullPath(filePath)}");
    return;
}

var stats = new Dictionary<string, (decimal Total, int Count)>();

foreach (var line in File.ReadLines(filePath))
{
    if (string.IsNullOrWhiteSpace(line)) continue;

    var cols = line.Split(',');
    if (cols.Length < 4) continue;

    if (!decimal.TryParse(cols[1].Trim('"'), out var price)) continue;

    var postCode = cols[3].Trim('"').Trim();
    if (string.IsNullOrWhiteSpace(postCode)) continue;

    int space = postCode.IndexOf(' ');
    if (space <= 0) continue;

    string prefix = postCode[..space];

    if (stats.TryGetValue(prefix, out var existing))
        stats[prefix] = (existing.Total + price, existing.Count + 1);
    else
        stats[prefix] = (price, 1);
}

Console.WriteLine("Top 10 postcode prefixes by average price:\n");

int rank = 1;
foreach (var row in stats
    .Select(kv => new { Prefix = kv.Key, Average = kv.Value.Total / kv.Value.Count })
    .OrderByDescending(x => x.Average)
    .Take(10))
{
    Console.WriteLine($"{rank,2}. {row.Prefix,-8} {row.Average,12:0}");
    rank++;
}
