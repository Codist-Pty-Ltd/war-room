// Reference — Approach A: Postcode LINQ pipeline
const string filePath = @"..\..\..\..\codings\invrstec_2.0\pp-monthly-update-new-version.csv";

if (!File.Exists(filePath))
{
    Console.WriteLine($"CSV not found: {Path.GetFullPath(filePath)}");
    Console.WriteLine("Copy pp-monthly-update-new-version.csv into project or fix path.");
    return;
}

Console.WriteLine("Top 10 postcode prefixes by average price:\n");

var top10 = File.ReadAllLines(filePath)
    .Where(line => !string.IsNullOrWhiteSpace(line))
    .Select(line => line.Split(','))
    .Where(cols => cols.Length >= 4)
    .Select(cols => new
    {
        Price = decimal.TryParse(cols[1].Trim('"'), out var p) ? p : (decimal?)null,
        PostCode = cols[3].Trim('"').Trim()
    })
    .Where(x => x.Price is not null && !string.IsNullOrWhiteSpace(x.PostCode))
    .Select(x => new { Prefix = x.PostCode!.Split(' ')[0], Price = x.Price!.Value })
    .Where(x => !string.IsNullOrWhiteSpace(x.Prefix))
    .GroupBy(x => x.Prefix)
    .Select(g => new { Prefix = g.Key, Average = g.Average(x => x.Price) })
    .OrderByDescending(x => x.Average)
    .Take(10);

int rank = 1;
foreach (var row in top10)
{
    Console.WriteLine($"{rank,2}. {row.Prefix,-8} {row.Average,12:0}");
    rank++;
}
