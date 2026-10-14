// Reference implementation — paste into Program.cs (Approach B)
// Manual JsonDocument walk + explicit sort (no LINQ on breeds except final OrderBy)

using System.Text.Json;
using System.Text.RegularExpressions;

const string ApiUrl = "https://dogapi.dog/api/v2/breeds";
const string FallbackFile = "breed-data-02.json";

string json = await LoadJsonAsync(ApiUrl, FallbackFile);
var breeds = ParseBreedsManual(json);

var topLife = GetTop10(
    breeds.ToList(),
    keySelector: b => b.MaxLife,
    tieBreak: b => b.Name);

var topWeight = GetTop10(
    breeds.ToList(),
    keySelector: b => b.MaxFemaleWeight,
    tieBreak: b => b.Name);

PrintRanked("Top 10 by Max Life Span", topLife, b => $"max_lifespan={b.MaxLife}");
PrintRanked("Top 10 Heaviest Female Breeds", topWeight, b => $"max_female_weight={b.MaxFemaleWeight}");

static async Task<string> LoadJsonAsync(string apiUrl, string fallbackFile)
{
    try
    {
        using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        return await client.GetStringAsync(apiUrl);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"API failed: {ex.Message}. Using {fallbackFile}.");
        if (!File.Exists(fallbackFile))
        {
            Console.Error.WriteLine("Fallback file missing.");
            Environment.Exit(1);
        }
        return await File.ReadAllTextAsync(fallbackFile);
    }
}

static List<BreedRow> ParseBreedsManual(string json)
{
    var breeds = new List<BreedRow>();
    using var doc = JsonDocument.Parse(json);

    JsonElement data = doc.RootElement.GetProperty("data");
    for (int i = 0; i < data.GetArrayLength(); i++)
    {
        JsonElement attributes = data[i].GetProperty("attributes");
        string name = attributes.GetProperty("name").GetString() ?? "";
        int maxLife = ExtractMax(attributes.GetProperty("life"));
        int maxFemaleWeight = ExtractMax(attributes.GetProperty("female_weight"));

        if (name.Length == 0) continue;
        breeds.Add(new BreedRow(name, maxLife, maxFemaleWeight));
    }

    return breeds;
}

static int ExtractMax(JsonElement field)
{
    if (field.ValueKind == JsonValueKind.Object)
    {
        if (field.TryGetProperty("max", out JsonElement maxEl) && maxEl.TryGetInt32(out int max))
            return max;
    }
    else if (field.ValueKind == JsonValueKind.String)
    {
        return MaxFromRangeString(field.GetString() ?? "");
    }
    return 0;
}

static int MaxFromRangeString(string s)
{
    int max = 0;
    foreach (Match m in Regex.Matches(s, @"\d+"))
    {
        int n = int.Parse(m.Value);
        if (n > max) max = n;
    }
    return max;
}

static List<BreedRow> GetTop10(
    List<BreedRow> breeds,
    Func<BreedRow, int> keySelector,
    Func<BreedRow, string> tieBreak)
{
    // Sort: max descending, then name ascending
    breeds.Sort((a, b) =>
    {
        int cmp = keySelector(b).CompareTo(keySelector(a));
        if (cmp != 0) return cmp;
        return string.Compare(tieBreak(a), tieBreak(b), StringComparison.Ordinal);
    });

    int take = Math.Min(10, breeds.Count);
    return breeds.GetRange(0, take);
}

static void PrintRanked(string title, List<BreedRow> rows, Func<BreedRow, string> metric)
{
    Console.WriteLine(title);
    for (int i = 0; i < rows.Count; i++)
        Console.WriteLine($"{i + 1}. {rows[i].Name} — {metric(rows[i])}");
    Console.WriteLine();
}

record BreedRow(string Name, int MaxLife, int MaxFemaleWeight);
