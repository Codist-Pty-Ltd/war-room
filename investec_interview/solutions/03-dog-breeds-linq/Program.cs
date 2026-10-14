// Reference implementation — paste into Program.cs (Approach A)
// Project: .NET 8 Console App, no NuGet packages

using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;

const string ApiUrl = "https://dogapi.dog/api/v2/breeds";
const string FallbackFile = "breed-data-02.json";

string json;
try
{
    using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
    json = await client.GetStringAsync(ApiUrl);
    Console.WriteLine("Loaded breeds from API.\n");
}
catch (Exception ex)
{
    Console.WriteLine($"API failed ({ex.Message}). Using fallback file.\n");
    if (!File.Exists(FallbackFile))
    {
        Console.Error.WriteLine($"Fallback not found: {FallbackFile}");
        Environment.Exit(1);
    }
    json = await File.ReadAllTextAsync(FallbackFile);
}

var breeds = ParseBreeds(json);

PrintTop10(
    "Top 10 by Max Life Span",
    breeds.OrderByDescending(b => b.MaxLife).ThenBy(b => b.Name).Take(10),
    b => $"max_lifespan={b.MaxLife}");

PrintTop10(
    "Top 10 Heaviest Female Breeds",
    breeds.OrderByDescending(b => b.MaxFemaleWeight).ThenBy(b => b.Name).Take(10),
    b => $"max_female_weight={b.MaxFemaleWeight}");

static List<BreedRow> ParseBreeds(string json)
{
    using var doc = JsonDocument.Parse(json);
    var list = new List<BreedRow>();

    foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
    {
        var attrs = item.GetProperty("attributes");
        var name = attrs.GetProperty("name").GetString() ?? "";
        var maxLife = ParseMax(attrs.GetProperty("life"));
        var maxWeight = ParseMax(attrs.GetProperty("female_weight"));

        if (string.IsNullOrWhiteSpace(name)) continue;
        list.Add(new BreedRow(name, maxLife, maxWeight));
    }

    return list;
}

static int ParseMax(JsonElement element)
{
    if (element.ValueKind == JsonValueKind.Object &&
        element.TryGetProperty("max", out var maxProp) &&
        maxProp.TryGetInt32(out var n))
        return n;

    if (element.ValueKind == JsonValueKind.String)
        return ParseRangeStringMax(element.GetString() ?? "");

    return 0;
}

static int ParseRangeStringMax(string text)
{
    // Optional: "10 - 12", "10–12", "10 to 12", "20 - 25 kg"
    var numbers = Regex.Matches(text, @"\d+")
        .Select(m => int.Parse(m.Value))
        .ToList();
    return numbers.Count == 0 ? 0 : numbers.Max();
}

static void PrintTop10(string title, IEnumerable<BreedRow> rows, Func<BreedRow, string> metric)
{
    Console.WriteLine(title);
    int rank = 1;
    foreach (var row in rows)
    {
        Console.WriteLine($"{rank}. {row.Name} — {metric(row)}");
        rank++;
    }
    Console.WriteLine();
}

record BreedRow(string Name, int MaxLife, int MaxFemaleWeight);
