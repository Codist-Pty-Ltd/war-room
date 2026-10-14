// Simplest dog breeds — read top to bottom, one file, no extra methods.
// .NET 8 Console App

using System.Text.Json;

// 1. Get JSON from API
string json;
try
{
    using var client = new HttpClient();
    json = await client.GetStringAsync("https://dogapi.dog/api/v2/breeds");
}
catch (Exception ex)
{
    Console.WriteLine("API error: " + ex.Message);
    return;
}

// 2. Parse each breed into a list
using var doc = JsonDocument.Parse(json);
var breeds = new List<(string Name, int MaxLife, int MaxWeight)>();

foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
{
    var a = item.GetProperty("attributes");
    breeds.Add((
        a.GetProperty("name").GetString() ?? "",
        a.GetProperty("life").GetProperty("max").GetInt32(),
        a.GetProperty("female_weight").GetProperty("max").GetInt32()
    ));



    Console.WriteLine(a.GetProperty("name").GetString());
}

// 3. Top 10 longest life (tie → name A-Z)
Console.WriteLine("Top 10 by Max Life Span");
int rank = 1;
foreach (var b in breeds.OrderByDescending(x => x.MaxLife).ThenBy(x => x.Name).Take(10))
{
    Console.WriteLine($"{rank}. {b.Name} — max_lifespan={b.MaxLife}");
    rank++;
}

Console.WriteLine();

// 4. Top 10 heaviest females (tie → name A-Z)
Console.WriteLine("Top 10 Heaviest Female Breeds");
rank = 1;
foreach (var b in breeds.OrderByDescending(x => x.MaxWeight).ThenBy(x => x.Name).Take(10))
{
    Console.WriteLine($"{rank}. {b.Name} — max_female_weight={b.MaxWeight}");
    rank++;
}
