# IKM TechCheck Full Stack Interview Prep - Reconstructed Q&A

This question bank was reconstructed from the screenshots in the chat session.
Some option wording is lightly normalized where the photo was cropped or blurred.

Use this as a War Room prep artifact for IKM / TechCheck-style full stack
screening covering C# 8, Angular 17, ASP.NET MVC 5 / Web API 2, ANSI SQL, and
DevOps.

## Quick index

- [Sample / warm-up questions](#sample--warm-up-questions)
- [C# 8.0 programming](#c-80-programming)
- [Angular 17](#angular-17)
- [ASP.NET MVC 5 / Web API 2](#aspnet-mvc-5--web-api-2)
- [ANSI SQL:2011](#ansi-sql2011)
- [DevOps / Git](#devops--git)

---

## Sample / warm-up questions

### 1. Capital city and country match

**Question:** Which of the following correctly matches a capital city with its country?

**Options:**

- Paris, Italy
- New York, United States
- London, United Kingdom
- Valletta, Malta
- Yangley, Antarctica

**Answer:**

- London, United Kingdom
- Valletta, Malta

### 2. Greek alphabet count

**Question:** What is the total number of letters in the Greek Alphabet?

**Options:**

- 3
- 24
- 27
- 3000
- 27,000,000

**Answer:** 24

---

## C# 8.0 programming

### 1. Struct `ToString()` override

**Question:** Which of the following are valid ways to define a `ToString()` method
to the C# struct below, such that it outputs the contents of the struct as a
string?

```csharp
public struct RegularShape
{
    public int NumberOfSides;
    public double LengthOfSide;
}
```

**Options:**

- `public string ToString() { ... }`
- `public static string ToString() { ... }`
- `public override string ToString() { ... }`
- `public override readonly string ToString() { ... }`
- `public constant string ToString() { ... }`

**Answer:**

- `public override string ToString() { ... }`
- `public override readonly string ToString() { ... }`

### 2. LINQ value 5 from list

**Question:** The C# code below creates a list of data. Which statements store
number `5` in the `result` variable?

```csharp
struct Example
{
    public string A;
    public int B;
}

List<Example> examples = new List<Example>();
examples.Add(new Example { A = "A", B = 1 });
examples.Add(new Example { A = "B", B = 2 });
examples.Add(new Example { A = "C", B = 3 });
examples.Add(new Example { A = "A", B = 4 });
examples.Add(new Example { A = "B", B = 5 });
examples.Add(new Example { A = "C", B = 6 });
examples.Add(new Example { A = "A", B = 7 });
examples.Add(new Example { A = "B", B = 8 });
examples.Add(new Example { A = "C", B = 9 });
```

**Options:**

- `int result = examples.Sum(x => x.B);`
- `int result = examples.Median(x => x.B);`
- `int result = Convert.ToInt32(examples.Average(x => x.B));`
- `int result = Convert.ToInt32(examples.Mode(x => x.B));`
- `int result = Convert.ToInt32(examples.Where(x => x.A == "B").Average(x => x.B));`

**Answer:**

- `int result = Convert.ToInt32(examples.Average(x => x.B));`
- `int result = Convert.ToInt32(examples.Where(x => x.A == "B").Average(x => x.B));`

### 3. Async operation from exception handler

**Question:** Which C# exception handlers can call an asynchronous operation named
`LogException`?

**Options:**

- `catch (Exception ex) { LogException(ex); }`
- `catch (Exception ex) { async Task LogException(ex); }`
- `try { await LogException(ex); }`
- `catch (Exception ex) { async LogException(ex); }`
- `catch (Exception ex) { await LogException(ex); }`

**Answer:**

- `catch (Exception ex) { await LogException(ex); }`

### 4. Namespace alias

**Question:** Which C# statement creates an alias `MyAlias` for namespace
`MyNamespace`?

**Options:**

- `Imports MyNamespace as MyAlias`
- `Imports MyNamespace = MyAlias`
- `using MyNamespace as MyAlias`
- `using MyNamespace = MyAlias`
- `using MyAlias = MyNamespace`

**Answer:** `using MyAlias = MyNamespace`

### 5. Generic constraints

**Question:** Which statements correctly describe the C# class below?

```csharp
class BaseClass<T, U>
    where T : U
    where U : class, new()
{
}
```

**Options:**

- Type `U` must be an abstract class.
- Type `T` can be a value type.
- Type `U` must have a parameterless constructor.
- Type `T` must be a reference type.
- Type `T` must be or derive from type `U`.

**Answer:**

- Type `U` must have a parameterless constructor.
- Type `T` must be or derive from type `U`.

### 6. Valid class definitions with inheritance and sealed override

**Question:** When creating a new C# class named `C`, which class definitions are
valid when considering classes `A` and `B` below?

```csharp
public class A
{
    protected virtual void method1() { }
    public void method2() { }
}

public class B : A
{
    protected override sealed void method1() { }
}
```

**Options:**

- `public class C : B { public static method2(int parm) { } }`
- `public class C : B { public void method3() { } }`
- `public sealed class C : B { protected override sealed void method1() { } }`
- `public class C : A { public void method3() { } }`
- `public class C : A { public override virtual void method1(string parm) { } }`

**Answer:**

- `public class C : B { public void method3() { } }`
- `public class C : A { public void method3() { } }`

### 7. Multicast delegates

**Question:** Which code snippets use `WriteDelegate` to invoke `WriteNumber`,
`WriteMoney`, and `WriteHexadecimal` so the output is:

```text
Number:        1,000
Money:         $1,000.00
Hexadecimal:   3E8
```

Given:

```csharp
public delegate void WriteDelegate(int value);

public static void WriteNumber(int num) { ... }
public static void WriteMoney(int money) { ... }
public static void WriteHexadecimal(int dec) { ... }
```

**Options:**

- Assign `WriteNumber`, then `+= WriteMoney`, then `+= WriteHexadecimal`, then call `writeDel1(1000)`.
- Assign `WriteNumber`, then replace with `WriteMoney`, then replace with `WriteHexadecimal`, then call.
- Create `writeDel1`, `writeDel2`, `writeDel3`, then `writeDel1 += writeDel2 + writeDel3`, then call.
- Create `writeDel1`, `writeDel2`, `writeDel3`, then `writeDel1 = writeDel2 + writeDel3`, then call.
- Assign only `WriteNumber`, then call.

**Answer:**

- `writeDel1 += WriteMoney; writeDel1 += WriteHexadecimal;`
- `writeDel1 += writeDel2 + writeDel3;`

### 8. File save failure in ASP.NET Core

**Question:** A .NET Core program uses `System.IO.File` to save images to a
publicly accessible `Images` folder. Testing shows files are not saved there.
Which option describes a possible reason?

**Options:**

- .NET Core saves files if CORS is enabled in `Startup.cs`.
- The `Images` folder may not give write permissions to the web user.
- The storage area must be FAT32, which is required by .NET Core.
- Image files above `1024px` by `1024px` are automatically redirected to a compressed folder.
- Web-based .NET Core programs cannot save files for security reasons.

**Answer:** The `Images` folder may not give write permissions to the web user.

### 9. Calling assembly

**Question:** Which C# statement receives a reference to the assembly that called
the currently executing method?

**Options:**

- `var assembly = System.Reflection.Assembly.GetCallingAssembly();`
- `var assembly = System.Reflection.Assembly.Load();`
- `var assembly = System.Reflection.Assembly.CallingAssembly;`
- `var assembly = System.Reflection.Assembly.ParentAssembly;`
- `var assembly = System.Reflection.Assembly.GetAssembly();`

**Answer:** `var assembly = System.Reflection.Assembly.GetCallingAssembly();`

### 10. Delegates for managed thread creation

**Question:** Which delegates represent a method executed when a managed thread
is created in C#?

**Options:**

- `ThreadStart`
- `StartThread`
- `TimerCallback`
- `WaitOrTimerCallback`
- `ParameterizedThreadStart`

**Answer:**

- `ThreadStart`
- `ParameterizedThreadStart`

### 11. Discards

**Question:** Which statements are correct regarding C# discards?

**Options:**

- The discard pattern cannot be used in pattern matching with `is` and `switch` keywords.
- Discards, designated as `_`, are temporary dummy variables intentionally unused in application code.
- Stand-alone discards cannot be used to ignore an object returned by an operation.
- Discards cannot be used when calling methods with `out` parameters.
- Discards cannot be used when deconstructing tuples.

**Answer:** Discards, designated as `_`, are temporary dummy variables intentionally unused in application code.

### 12. Update string to uppercase

**Question:** Which statement substitutes `*****` to update `MyString` with
`"ABC"`?

```csharp
String MyString = "abc";
*****
```

**Options:**

- `MyString.ToUpperString();`
- `MyString = MyString.ToUpper();`
- `MyString.ToUpper();`
- `MyString = MyString.ToUpperInvariant();`
- `MyString = MyString.ToUpperCase();`

**Answer:** `MyString = MyString.ToUpper();`

### 13. String methods using `params`

**Question:** Which C# `String` methods use the `params` keyword in their method
definitions?

**Options:**

- `String.Join()`
- `String.Contains()`
- `String.Format()`
- `String.Concat()`
- `String.Copy()`

**Answer:**

- `String.Join()`
- `String.Format()`
- `String.Concat()`

### 14. Namespace alias in nested namespace code

**Question:** Which statements are valid for the C# namespace code below?

```csharp
using System; // Line A

namespace Admin
{
    namespace Fill
    {
        interface Bin { void Add(); }
    }

    namespace Empty
    {
        interface Bin { void Empty(); }
    }
}

namespace Company
{
    class CompanyWaste : Emptying.Bin // Line B
    {
        public void Empty() { }
    }
}
```

**Options:**

- The code compiles if Line A is replaced by `using Emptying = Admin.Empty;`
- The code compiles if Line B is replaced by `class CompanyWaste : Bin`
- The code compiles if Line A is replaced by `using Emptying = Admin.Fill;`
- The code compiles as written.
- The code compiles if Line B is replaced by `class CompanyWaste : Empty.Bin`

**Answer:** The code compiles if Line A is replaced by `using Emptying = Admin.Empty;`

### 15. `dynamic` type runtime

**Question:** The dynamic type exposes which of the following to C#?

**Options:**

- SQL Common Language Runtime
- Dynamic Language Runtime
- Common Language Runtime
- .NET Language Runtime
- Active Language Runtime

**Answer:** Dynamic Language Runtime

### 16. Pattern matching any hexagon side length

**Question:** Which pattern substitutes `*****` to find a hexagon with any side
length?

```csharp
RegularShape shape = new RegularShape
{
    NumberOfSides = 8,
    LengthOfSide = 10
};

var testResult = shape switch
{
    RegularShape (8, 10) => "Found an octagon with side length 10",
    *****
};
```

**Options:**

- `RegularShape (6, *) => "Found a hexagon"`
- `RegularShape (6, null) => "Found a hexagon"`
- `RegularShape (6, x => x > 0) => "Found a hexagon"`
- `RegularShape (6, _) => "Found a hexagon"`
- `RegularShape (6, 10) => "Found a hexagon"`

**Answer:** `RegularShape (6, _) => "Found a hexagon"`

### 17. USB drive removed while reading file

**Question:** A C# snippet reads a text file from a USB drive:

```csharp
String path = "D:\file.txt";

using (StreamReader sr = File.OpenText(path))
{
    while (!sr.EndOfStream)
    {
        String s = sr.ReadLine();
        Console.WriteLine(s);
    }
}
```

The USB drive is removed before the code finishes reading. What best describes
the program behavior?

**Options:**

- It throws an `IOError` error and terminates.
- It throws an `IOException` error and terminates.
- It throws an `IOStreamException` error and terminates.
- It throws a `FileNotFoundException` error and terminates.
- It continues without errors but does not print the whole file.

**Answer:** It throws an `IOException` error and terminates.

### 18. Rectangle class storage

**Question:** Which statements correctly describe the class definition below?

```csharp
public class Rectangle
{
    public double X1 { get; set; }
    public double X2 { get; set; }
    public float Y1 { get; set; }
    public float Y2 { get; set; }

    public double Area
    {
        get { return (X2 - X1) * (Y2 - Y1); }
    }
}
```

**Options:**

- The class definition can be changed to a `struct` and provide the same functionality without any other modification.
- Instances of this class are stored on the stack because it contains only value types.
- Instances of this class are stored on the heap.
- The `Area` property will raise a conversion exception.
- This class cannot be instantiated since it has no constructor.

**Answer:** Instances of this class are stored on the heap.

### 19. Generic collections

**Question:** In C#, which of the following are generic collections?

**Options:**

- `ArrayList<>`
- `List<T>`
- `Hashtable<T>`
- `HashSet<T>`
- `Dictionary<TKey,TValue>`

**Answer:**

- `List<T>`
- `HashSet<T>`
- `Dictionary<TKey,TValue>`

### 20. LINQ `where` clauses

**Question:** Which `where` clauses correctly substitute `*****` in the LINQ query
below to allow successful compilation and execution?

```csharp
int[] Numbers = { 1, 5, 30, 13, 22, 7 };

var Results = from Number in Numbers
              *****
              select Number;
```

**Options:**

- `where Number = 5`
- `where (Number / 2.0) > 20`
- `where Number in (5, 30)`
- `where Number < Numbers.Average()`
- `where Number == System.DateTime.Now.Day`

**Answer:**

- `where (Number / 2.0) > 20`
- `where Number < Numbers.Average()`
- `where Number == System.DateTime.Now.Day`

### 21. Microsoft-recommended performance practices

**Question:** Which Microsoft-recommended best practices improve performance of
a C# program?

**Options:**

- Use `StringBuilder.Append` instead of `String.Concat`.
- Use a `foreach` loop instead of LINQ to iterate through a collection or list.
- Compare two strings using `ToLower` and the `==` operator instead of using `String.Compare`.
- Use an `ArrayList` instead of a `List<T>`.
- Use more `try-catch` statements instead of `if` statements.

**Answer:**

- Use `StringBuilder.Append` instead of `String.Concat`.
- Use a `foreach` loop instead of LINQ to iterate through a collection or list.

### 22. Interface members with same name/signature

**Question:** Which statements correctly describe a C# class that implements the
interfaces below, where members have the same name and signature?

```csharp
interface ISquare
{
    int X { get; }
}

interface IRectangle
{
    int X();
}
```

**Options:**

- The class will not use members of both interfaces as their implementation.
- The class cannot implement interfaces containing members with the same signature.
- To implement both interfaces, the class may provide explicit implementations for both property `X` and method `X`.
- To implement both interfaces, the class must use a private implementation for property `X`.
- To implement both interfaces, both method `X` and property `X` should be implemented, with one implemented explicitly.

**Answer:**

- To implement both interfaces, the class may provide explicit implementations for both property `X` and method `X`.
- To implement both interfaces, both method `X` and property `X` should be implemented, with one implemented explicitly.

### 23. Enum parsing

**Question:** A C# enum is defined below. If `myEnumString` has value
`"Disconnecting"`, which snippets obtain the corresponding enum value?

```csharp
public enum ConnectionStates
{
    Connecting,
    Disconnecting
}
```

**Options:**

- `ConnectionStates myEnumValue = (ConnectionStates)Enum.Parse(typeof(ConnectionStates), myEnumString);`
- `ConnectionStates myEnumValue = Enum.TryParse<ConnectionStates>(myEnumString);`
- `ConnectionStates myEnumValue = ConnectionStates.Parse(myEnumString);`
- `ConnectionStates myEnumValue; Enum.TryParse<ConnectionStates>(myEnumString, out myEnumValue);`
- `ConnectionStates myEnumValue = typeof(ConnectionStates) myEnumString;`

**Answer:**

- `ConnectionStates myEnumValue = (ConnectionStates)Enum.Parse(typeof(ConnectionStates), myEnumString);`
- `ConnectionStates myEnumValue; Enum.TryParse<ConnectionStates>(myEnumString, out myEnumValue);`

### 24. Methods that compile

**Question:** Which C# methods can compile successfully?

**Options:**

- `protected Int32 addTwoNumbers(int a, int b) { return a - b; }`
- `public void addNumbers(int a, int b) { return a + b; }`
- `public String MarkOrderProcessed(int orderNumber) { if (orderNumber == null) ... return orderNumber; }`
- `void a() { }`
- `private static checkNumberNotOne(int a) { if (a == 1) throw new ArgumentException(); }`

**Answer:**

- `protected Int32 addTwoNumbers(int a, int b) { return a - b; }`
- `void a() { }`

### 25. Locking shared file updates

**Question:** The C# code below might corrupt a file being updated. Which
replacement for `StartUpdate()` allows only one thread to execute at a time on
the shared file?

```csharp
public void UpdateFile(string fileName, string data)
{
    StreamWriter writer = new StreamWriter(fileName, false);
    writer.Write(data);
    writer.Close();
}
```

**Answer:**

```csharp
object _lock = 0;

Thread t1 = new Thread(() => { lock (_lock) { UpdateFile(@"c:\data.txt", "abc"); } });
Thread t2 = new Thread(() => { lock (_lock) { UpdateFile(@"c:\data.txt", "xyz"); } });

t1.Start();
t2.Start();
```

### 26. Delegate definition

**Question:** Which statement correctly describes a delegate in C#?

**Options:**

- Enables operations to bypass compile-time type checking.
- A type that represents references to methods with a parameter list and return type.
- Contains definitions for related functionality that a class or struct can implement.
- Enables a class or object to notify other classes or objects when an event occurs.
- A value type used to encapsulate small groups of related variables.

**Answer:** A type that represents references to methods with a parameter list and return type.

### 27. Regular expressions

**Question:** Which statements are correct regarding C# regular expressions?

**Options:**

- Regular expressions provide a method for processing text.
- Regular expressions do not allow for substitutions.
- Regular expressions allow the forward slash `/` as a special character.
- Regular expressions use `$` to indicate the match must occur at the beginning of the line or string.
- Regular expressions cannot ignore letter case.

**Answer:** Regular expressions provide a method for processing text.

### 28. Isolated storage

**Question:** If the C# fragment below is executed, which statements are correct?

```csharp
IsolatedStorageFile userStore = IsolatedStorageFile.GetUserStoreForAssembly();
IsolatedStorageFileStream userStream =
    new IsolatedStorageFileStream("MyDomain.JohnDoe", FileMode.Create, userStore);
StreamWriter userWriter = new StreamWriter(userStream);
userWriter.Write("Read|Write");
userWriter.Close();
```

**Options:**

- A file is created that can be read by a `StreamReader` using `GetMachineStoreForAssembly()`.
- A file is created that contains the data `Read|Write`.
- A file is created that the application can only access when running under the user `JohnDoe`.
- A file is created that the application can only access when running under the current user.
- User `MyDomain` is granted Read/Write access to the sandboxed file area.

**Answer:**

- A file is created that contains the data `Read|Write`.
- A file is created that the application can only access when running under the current user.

### 29. LINQ join students and classes

**Question:** Which LINQ snippets query students enrolled in each class to output:

```text
Jane Doe is enrolled in History
Jane Doe is enrolled in Chemistry
John Doe is enrolled in Biology
```

**Options:**

- Query syntax with `from s in students join c in classes on s.ID equals c.StudentID select new { s.FullName, c.ClassName }`
- Query syntax starting from `classes`, joining `students`, selecting `ID`, `FullName`, `ClassName`, then `ToList().OrderBy(...)`
- Method syntax using `students.Join(classes, s => s.ID, c => c.StudentID, (s, c) => new { s.FullName, c.ClassName })`
- `students.InnerJoin(...)`
- Query syntax with malformed anonymous object braces

**Answer:**

- `var query = students.Join(classes, s => s.ID, c => c.StudentID, (s, c) => new { s.FullName, c.ClassName });`
- `var query = from s in students join c in classes on s.ID equals c.StudentID select new { s.FullName, c.ClassName };`

### 30. Async warning CS4014

**Question:** The C# program below contains warning CS4014 because `MethodAsync()`
is not awaited. Which changes result in no compilation warnings or errors and
successful execution?

```csharp
static void Main(string[] args)
{
    MethodAsync();
    Console.WriteLine("done");
}

static async Task MethodAsync()
{
    await Task.Delay(1000);
}
```

**Options:**

- Replace only `static void Main(string[] args)` with `static async Task Main(string[] args)`.
- Replace `Main` with `static async Task Main(string[] args)` and call `await MethodAsync();`.
- Replace `MethodAsync();` with `async MethodAsync();`.
- Replace `MethodAsync();` with `MethodAsync().GetAwaiter().GetResult();`.
- Replace `MethodAsync();` with `await MethodAsync();` while keeping `Main` non-async.

**Answer:**

- Replace `Main` with `static async Task Main(string[] args)` and call `await MethodAsync();`.
- Replace `MethodAsync();` with `MethodAsync().GetAwaiter().GetResult();`.

### 31. Event subscription

**Question:** Which statement subscribes the event to the event handler
`HandleEvent`?

```csharp
class Work
{
    public event EventHandler SomethingHappened;
}

class Logger
{
    public void HandleEvent(object sender, EventArgs args) { ... }
}

Work work = new Work();
Logger logger = new Logger();
*****
```

**Options:**

- `work.SomethingHappened -= logger.HandleEvent;`
- `work.SomethingHappened == logger.HandleEvent;`
- `work.SomethingHappened => logger.HandleEvent;`
- `work.SomethingHappened = logger.HandleEvent;`
- `work.SomethingHappened += logger.HandleEvent;`

**Answer:** `work.SomethingHappened += logger.HandleEvent;`

### 32. Null-coalescing list result

**Question:** Which option describes the complete contents of `list` after the
code executes?

```csharp
List<int> list = null;
list = GetList(list);
list = GetList(new List<int> { 1, 2, 3 });
(list ??= new List<int>()).Add(4);

List<int> GetList(List<int> testList)
{
    testList ??= new List<int>();
    return testList;
}
```

**Options:**

- `4`
- `1, 2, 3`
- An empty list
- `1, 2, 3, 4`
- `null`

**Answer:** `1, 2, 3, 4`

### 33. `IEnumerable` implementation

**Question:** A generic collection class `Pile<T>` must implement `IEnumerable`
so it can iterate over elements stored in an array called `pile`. Which functions
must be included?

**Options:**

- `public IEnumerator GetEnumerator() { foreach (T val in pile) { yield return val; } }`
- `public IEnumerator GetEnumerator() { foreach (T val in pile) { return val; yield; } }`
- `public IEnumerable Enumerator() { foreach (T val in pile) { return val; } }`
- `public static IEnumerator GetEnumerator() { ... }`
- `IEnumerator IEnumerable.GetEnumerator() { return this.GetEnumerator(); }`

**Answer:**

- `public IEnumerator GetEnumerator() { foreach (T val in pile) { yield return val; } }`
- `IEnumerator IEnumerable.GetEnumerator() { return this.GetEnumerator(); }`

### 34. `DynamicObject` compile error

**Question:** Why does the C# code below generate an error when compiled?

```csharp
dynamic dog = new DynamicObject();
dog.breed = "Labrador";
```

**Options:**

- `DynamicObject` is an abstract class that must be inherited before use.
- `DynamicObject` must be declared with `var` or `DynamicObject`.
- `DynamicObject` defines an attribute that can be placed on a class to make it dynamic.
- `DynamicObject` does not fully implement `IDynamicMetaObjectProvider` and must be inherited by another class so behavior can be defined.
- `dog.breed = "Labrador";` must use `BindProperty`.

**Answer:** `DynamicObject` does not fully implement `IDynamicMetaObjectProvider` and must be inherited by another class so behavior can be defined.

### 35. Performance counter debugger break

**Question:** `System.Diagnostics` monitoring code checks processor usage:

```csharp
PerformanceCounter processorPercent =
    new PerformanceCounter("Processor", "% Processor Time", "_Total");
```

Which block can cause the debugger to break when processor time goes above 30%?

**Options:**

- `if (processorPercent > 30) { Debugger.Break(); }`
- `Debugger.Break(processorPercent, Debugger.ConditionGreaterThan, 30);`
- `if ((decimal)processorPercent > 30) { Debugger.Break(); }`
- `if (processorPercent.GreaterThan(30)) { Debugger.Break(); }`
- `if (processorPercent.NextValue() > 30f) Debugger.Break();`

**Answer:** `if (processorPercent.NextValue() > 30f) Debugger.Break();`

### 36. Tuple named elements

**Question:** Which statement substitutes `*****` to output the population of New
York City?

```csharp
var city = "New York City";
var state = "New York";
var pop = 8_623_000;
*****

WriteLine($"The population of {locationPopulation.City}, {locationPopulation.State} is: {locationPopulation.pop:n0}");
```

**Options:**

- `var locationPopulation = (City: city, State: state, Pop: pop);`
- `var locationPopulation = (City: city, State: state, pop);`
- `var locationPopulation = (string city, string state, int pop);`
- `var locationPopulation = (city, state, pop);`
- `var locationPopulation = (string City, string State, int pop);`

**Answer:** `var locationPopulation = (City: city, State: state, pop);`

### 37. Pattern matching

**Question:** Which statements are correct regarding pattern matching in C#?

**Options:**

- Supports `is` expressions.
- Pattern matching does not work on generic types.
- Switch pattern matching does not support the constant pattern.
- Supports `switch` expressions.
- Allows inspection of an object and its properties to determine if it satisfies the sought pattern.

**Answer:**

- Supports `is` expressions.
- Supports `switch` expressions.
- Allows inspection of an object and its properties to determine if it satisfies the sought pattern.

### 38. Class definitions that compile

**Question:** Which C# class definitions compile successfully?

**Options:**

- `public class MyClass { public String myClass; }`
- `public interface MyInterface { public MyInterface(); }`
- `public class MyClass { private MyClass() { } }`
- `public class MyClass { public String MyClass() { return "Instantiation successful"; } }`
- `public class MyClass { public MyClass(String newValue) : this() { } }`

**Answer:**

- `public class MyClass { public String myClass; }`
- `public class MyClass { private MyClass() { } }`

### 39. Obsolete attribute that causes compiler error

**Question:** Which attribute marks `MethodA()` as deprecated and causes a
compiler error?

```csharp
using System;

public class Program
{
    *****
    public void MethodA()
    {
        Console.WriteLine("MethodA");
    }
}
```

**Options:**

- `[Obsolete()]`
- `[Obsolete]`
- `[Obsolete(message: "This will be removed in version 2", true)]`
- `[Obsolete(true)]`
- `[Obsolete("This will be removed in version 2")]`

**Answer:** `[Obsolete("This will be removed in version 2", true)]`

---

## Angular 17

### 1. Conditional CSS class

**Question:** Which Angular property binding applies a CSS class to an element
based on a component property?

**Options:**

- `<div class="{{'my-class': condition}}"></div>`
- `<div class="'my-class': condition"></div>`
- `<div class="{ 'my-class': condition }"></div>`
- `<div [ngClass]="{'my-class': condition}"></div>`
- `<div ngClass="my-class" *ngIf="condition"></div>`

**Answer:** `<div [ngClass]="{'my-class': condition}"></div>`

### 2. Show textarea when checkbox selected

**Question:** A feedback form must display a textarea for additional comments if
the customer selects a checkbox indicating required feedback. Which template
syntax displays the textarea based on `hasFeedback`?

**Options:**

- `[ngStyle]="{display: hasFeedback ? 'block' : 'none'}"`
- `*ngIf="hasFeedback"`
- `[(ngModel)]="hasFeedback"`
- `[ngClass]="hasFeedback"`
- `@Input()="hasFeedback"`

**Answer:** `*ngIf="hasFeedback"`

### 3. Lazy-loaded service not shared across modules

**Question:** When using lazy-loaded modules in Angular 17, which actions ensure
a service is not shared across different modules?

**Options:**

- Declare the service as a private member.
- Provide the service in the lazy-loaded module's providers array.
- Use the `@Singleton` decorator.
- Use `@Injectable({ providedIn: 'root' })`.
- Provide the service in the component providers.

**Answer:**

- Provide the service in the lazy-loaded module's providers array.
- Provide the service in the component providers.

### 4. RxJS transform and threshold filter

**Question:** An Angular application receives a stream from an API. The developer
must only emit values greater than a threshold while transforming remaining data
to a required format. Which RxJS operators meet the requirement?

**Options:**

- `map`
- `filter`
- `tap`
- `reduce`
- `scan`

**Answer:**

- `map`
- `filter`

### 5. Lazy loading route configuration

**Question:** Which step configures a module to be loaded when its dedicated
route is accessed?

**Options:**

- Import the lazy-loaded module in `AppModule`.
- Add `loadChildren` to the route definition.
- Set up an undefined routing module for the lazy-loaded module.
- Use `CanLoad` guard to eliminate unauthorized access.
- Preload the module during application initialization.

**Answer:** Add `loadChildren` to the route definition.

### 6. Add `FormControl` to `FormArray`

**Question:** Which method adds a `FormControl` to a `FormArray` in an Angular 17
reactive form?

**Options:**

- `this.myFormArray.controls.push(new FormControl(''))`
- `this.myFormArray.push(new FormControl(''))`
- `this.myForm.get('myFormArray').controls.add(new FormControl(''))`
- `this.myFormArray.addControl(new FormControl(''))`
- `this.myForm.get('myFormArray').push(new FormControl(''))`

**Answer:** `this.myFormArray.push(new FormControl(''))`

### 7. Custom preloading strategy

**Question:** An Angular app must preload components and modules based on user
behavior patterns. Which option implements this preloading strategy?

**Options:**

- Implement a custom preloading strategy by extending Angular `PreloadingStrategy`.
- Import and initialize required modules within the component class.
- Use `*ngIf` to preload components based on user actions and store state in a service.
- Use Angular's `PreloadAllModules` strategy in router configuration.
- Use Angular `OnPush` change detection to optimize loading.

**Answer:** Implement a custom preloading strategy by extending Angular `PreloadingStrategy`.

### 8. Default route

**Question:** Which approaches define a default route in Angular 17 routing?

**Options:**

- `{ path: '', component: HomeComponent }`
- `{ path: '', redirectTo: '/home', pathMatch: 'full' }`
- `{ path: '/', component: HomeComponent }`
- `{ path: 'default', component: HomeComponent }`
- `{ path: 'home', component: HomeComponent }`

**Answer:**

- `{ path: '', component: HomeComponent }`
- `{ path: '', redirectTo: '/home', pathMatch: 'full' }`

### 9. Retry API request and handle errors

**Question:** An Angular app fetches data from a remote API that fails due to
network issues. It must retry up to three times and handle errors if retries
fail. Which RxJS operators handle this?

**Options:**

- `concatMap` and `take`
- `catchError` and `switchMap`
- `retry` and `catchError`
- `catchError` and `scan`
- `retry` and `takeWhile`

**Answer:** `retry` and `catchError`

### 10. Separate `UserService` instance in feature module

**Question:** A root-level `UserService` manages user data. `AdminModule` needs a
separate instance for admin-specific operations. What must be executed?

**Options:**

- Use `@Optional()` in the constructor of `UserService`.
- Use `Injector.create()` within `AdminModule`.
- Instantiate `UserService` in admin components.
- Use `providedIn: 'root'` in `@Injectable()`.
- Declare `UserService` in the providers array of `AdminModule`.

**Answer:** Declare `UserService` in the providers array of `AdminModule`.

### 11. Reactive form validity after adding/removing controls

**Question:** When adding or removing controls in a reactive form, what must be
done to maintain form validity and performance?

**Options:**

- Validate controls have a unique `formControlName`.
- Remove associated validators from removed controls to eliminate memory leaks.
- Manually invoke `updateValueAndValidity()` on the parent form group after modifications.
- Use `trackBy` in `*ngFor` for form arrays in the template.
- Keep a fixed size for the `FormArray`.

**Answer:** Manually invoke `updateValueAndValidity()` on the parent form group after modifications.

### 12. Two-way data binding

**Question:** A form must reflect component model changes and update component
state when user input changes. Which options are valid for two-way binding?

**Options:**

- Event binding to capture user input and update the model.
- The `ngModel` directive on form elements.
- An event emitter to propagate changes to other components.
- A model property in the component class.
- Property binding to pass data from the component to the view.

**Answer:**

- Event binding to capture user input and update the model.
- The `ngModel` directive on form elements.
- A model property in the component class.
- Property binding to pass data from the component to the view.

### 13. Logger service custom module configuration

**Question:** A `LoggerService` is used across modules. Modules require separate
logger configurations but must fall back to root defaults. Which steps achieve
this?

**Options:**

- Provide `LoggerService` in the providers array of modules requiring custom configuration.
- Declare `LoggerService` with `providedIn: 'root'` and override in each module's providers array.
- Provide `LoggerService` in a shared module and import the shared module where custom configurations are required.
- Inject `LoggerService` using `Injector.create()` in modules.
- Use `@Optional()` in the constructor of `LoggerService` to permit optional custom configuration.

**Answer:**

- Provide `LoggerService` in the providers array of modules requiring custom configuration.
- Declare `LoggerService` with `providedIn: 'root'` and override in each module's providers array.
- Use `@Optional()` in the constructor of `LoggerService` to permit optional custom configuration.

### 14. Pass data to a route without URL

**Question:** Which Angular actions pass data to a route without using the URL?

**Options:**

- Use the `data` property in route configuration.
- Local storage to pass data.
- Store the data in a service.
- Pass data through component properties.
- Query parameters.

**Answer:**

- Use the `data` property in route configuration.
- Store the data in a service.
- Pass data through component properties.

### 15. Generate checkboxes from preferences array

**Question:** A form must generate labeled checkboxes from a preferences array.
Which template approach implements this?

**Options:**

- Use `[ngClass]` to add classes to each checkbox.
- Use `*ngFor` to iterate over the `preferences` array and create a checkbox for each item.
- Use `@Input()` to pass preferences into a child component.
- Use `*ngIf` to create a checkbox for each preference.
- Use `*ngSwitch` to select the required template by preference type.

**Answer:** Use `*ngFor` to iterate over the `preferences` array and create a checkbox for each item.

### 16. Parent-to-child input binding

**Question:** A parent component must pass data to a child component by binding a
property to an `@Input()` property. Which syntax is required?

**Options:**

- `<child-component bind-inputProperty="parentProperty"></child-component>`
- `<child-component inputProperty="{{parentProperty}}"></child-component>`
- `<child-component (inputProperty)="parentProperty"></child-component>`
- `<child-component [inputProperty]="parentProperty"></child-component>`
- `<child-component {{{inputProperty}}}="parentProperty"></child-component>`

**Answer:** `<child-component [inputProperty]="parentProperty"></child-component>`

### 17. Template-driven validation

**Question:** Which techniques implement validation for an input field in an
Angular 17 template-driven form?

**Options:**

- Add `minlength` and `maxlength` attributes to the input element.
- Use the `required` attribute on the input element.
- Use the `formControl` directive in the template.
- Use the `Validators.required` directive in the component class.
- Use the `name="ngModel"` template reference variable.

**Answer:**

- Add `minlength` and `maxlength` attributes to the input element.
- Use the `required` attribute on the input element.
- Use the `name="ngModel"` template reference variable.

### 18. RxJS unsubscribe on component destroy

**Question:** An Angular component uses an observable stream. To eliminate memory
leaks, it must unsubscribe when the component is destroyed. Which approach is
used?

**Answer:**

Use `takeUntil(this.onDestroy$)` and complete the destroy subject:

```ts
this.mouseMoves.pipe(
  takeUntil(this.onDestroy$)
).subscribe(position => console.log(position));

ngOnDestroy() {
  this.onDestroy$.next();
  this.onDestroy$.complete();
}
```

---

## ASP.NET MVC 5 / Web API 2

### 1. Web API 2 GET attribute

**Question:** A Web API 2 controller method has this signature:

```csharp
public Product FindProduct(int id) { }
```

Which attribute allows HTTP GET requests made to the `Product` controller to be
processed by this method?

**Options:**

- `[Accept = GET]`
- `[HttpGet]`
- `[GET]`
- `[HTTPVerb("GET")]`
- `[Route("HttpGet")]`

**Answer:** `[HttpGet]`

### 2. MVC editor for nested property

**Question:** A view allows editing a `Person` and their `HomeAddress`. Which
snippet creates an editable field for `HomeAddress.City`?

```csharp
public class Address
{
    public string Line1 { get; set; }
    public string Line2 { get; set; }
    public string City { get; set; }
    public string ZipCode { get; set; }
}

public class Person
{
    public string Name { get; set; }
    public Address HomeAddress { get; set; }
}
```

**Options:**

- `@Html.EditorFor(a => a.Person.HomeAddress.City)`
- `@Html.EditorForChild(a => a.HomeAddress.City)`
- `@Html.EditorFor(a => a.HomeAddress.City)`
- `@Html.EditorFor(@Model.Person.HomeAddress.City)`
- `@Html.EditorFor(p => p.Person.(a => a.HomeAddress.City))`

**Answer:** `@Html.EditorFor(a => a.HomeAddress.City)`

### 3. MVC `ActionLink`

**Question:** An MVC 5 Razor view contains:

```csharp
@Html.ActionLink("Next", "List", new { page = 2 });
```

The view was returned from `HomeController.Index`. Which HTML output is
generated?

**Options:**

- `<a href="List?page=2">Next</a>`
- `<a href="/Home/Next?page=2">List</a>`
- `<a href="/Home/List?page=2">Next</a>`
- `<a href="/List?page=2">Next</a>`
- `<a href="/Home/List/2">Next</a>`

**Answer:** `<a href="/Home/List?page=2">Next</a>`

### 4. `UpdateModel` but exclude `ID`

**Question:** Given:

```csharp
public class Person
{
    public int ID { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
```

Which snippets call model binding but do not update `ID`?

**Options:**

- `UpdateModel(person, new[] { "ID" });`
- `UpdateModel(person, omit = new[] { "ID" });`
- `UpdateModel(person, new[] { "FirstName", "LastName" });`
- `UpdateModel(person, Accept = new[] { "FirstName", "LastName" });`
- `UpdateModel(person, new[] { FirstName = AcceptValue, LastName = AcceptValue, ID = RejectValue });`

**Answer:** `UpdateModel(person, new[] { "FirstName", "LastName" });`

### 5. Web API 2 exception to HTTP status code

**Question:** In a Web API 2 service, which action allows returning meaningful
HTTP status codes for specific .NET exceptions?

**Options:**

- Override `WebApiConfig.OnException` in `WebApiConfig.cs`.
- Override `WebApiApplication.OnException` in `Global.asax.cs`.
- Override `Startup.OnException` in `Startup.cs`.
- Add an `<httpResponseException>` section to `web.config`.
- Create a filter deriving from `ExceptionFilterAttribute` and override `OnException`.

**Answer:** Create a filter that derives from `ExceptionFilterAttribute` and overrides `OnException` to map the exception to an `HttpResponseException` / status code.

### 6. MVC validation stops after five errors

**Question:** An MVC 5 form uses built-in validation attributes. The developer
wants validation to stop after five errors. Which action completes the
implementation?

**Options:**

- Add `filters.Add(new ValidationErrorAttribute(5));` to `RegisterGlobalFilters` in `FilterConfig.cs`.
- Use an `Html.BeginForm(5)` overload.
- Call `TryValidateModel(5)` in the controller action.
- Add `@Html.ValidateModelErrors(5)` to the form.
- Add `services.AddMvc(options => options.MaxModelValidationErrors = 5)` to `Startup.cs`.

**Answer:** Add this code to the `RegisterGlobalFilters` method of `FilterConfig.cs`: `filters.Add(new ValidationErrorAttribute(5));`

### 7. MVC action filter logging

**Question:** Which options create an action filter called `Logging` to log
requests to specific controller methods and ensure it is called for each request?

**Options:**

- Create `LoggingAttribute` deriving from `FilterAttribute`, overriding `OnActionExecuting` and `OnActionExecuted`.
- Create `LoggingAttribute` implementing `IFilterAttribute`, overriding `OnActionExecuting` and `OnActionExecuted`.
- Create `LoggingAttribute` deriving from `ActionFilterAttribute`, overriding `OnActionExecuting` and `OnActionExecuted`.
- Add the class to global filters in `RegisterGlobalFilters`.
- Add `[Logging]` to controller methods that require logging.

**Answer:**

- Create `LoggingAttribute` deriving from `ActionFilterAttribute` and override `OnActionExecuting` / `OnActionExecuted`.
- Add the `[Logging]` attribute to the controller methods that require logging.

### 8. Web API 2 route URL

**Question:** A Web API 2 application has this route:

```csharp
config.Routes.MapHttpRoute(
    name: "DefaultApi",
    routeTemplate: "api/{controller}/{id}",
    defaults: new { id = RouteParameter.Optional }
);
```

And `ProductsController` contains:

```csharp
public IEnumerable<Product> GetAllProducts()
{
    return products;
}
```

Which URL correctly calls this method?

**Options:**

- `/products`
- `/Products/GetAllProducts`
- `/GetAllProducts`
- `/api/products`
- `/api/GetAllProducts`

**Answer:** `/api/products`

### 9. MVC route URL with required int parameter

**Question:** Given:

```csharp
public class HomeController : Controller
{
    public ActionResult Index(int id)
    {
        return View();
    }
}
```

Route:

```csharp
routes.MapRoute(
    "Default",
    "{controller}/{action}/{id}",
    new { controller = "Home", action = "Index", id = "" }
);
```

Which URL correctly calls `Index`?

**Options:**

- `/`
- `/Home/Index/3`
- `/Home/Index/abc`
- `/Home`
- `/Home/Index`

**Answer:** `/Home/Index/3`

### 10. MVC default model binder values from request body

**Question:** Which action ensures all values used by the default model binder in
`UpdateModel(...)` are taken from the body of the HTTP request?

**Options:**

- Call `UpdateModel` with the model as first parameter and a `FormValueProvider` as second parameter.
- Create a `BindingContext` object, passing `ControllerContext`, then call `UpdateModel` with it.
- Use `ControllerContext.FromBody`.
- Call `UpdateModel` with a `FormValueProvider` as third parameter and current `ControllerContext`.
- Use `BindingContext.FormValueProvider`.

**Answer:** Call `UpdateModel` with the model to update as the first parameter and a `FormValueProvider` object as the second parameter.

### 11. MVC remote validation

**Question:** A registration page must validate a unique username on the server
without waiting for form submit. Which tasks are required?

**Options:**

- Create `CheckUserName(string UserName)` in `RegisterController`, validate uniqueness, return Boolean `true`/`false`.
- Create `CheckUserName(RegisterUser user)`, validate uniqueness, return JSON.
- Add `[Remote("CheckUserName", "Register")]` to the `UserName` field.
- Create `CheckUserName(string UserName)`, validate uniqueness, return `true`/`false` wrapped in JSON.
- Add `[ValidationCallBack("CheckUserName", "Register")]`.

**Answer:**

- Create a `CheckUserName` method in the `Register` controller that takes a string `UserName`, validates uniqueness, and returns `true` or `false` wrapped in JSON.
- Add `[Remote("CheckUserName", "Register")]` to the `UserName` field in `RegisterUser`.

### 12. MVC 5 routes

**Question:** Which statements correctly describe routes in MVC 5?

**Options:**

- If a URL pattern matches multiple routes, an exception is thrown at runtime.
- Routes do not map to specific files.
- A URL pattern is mapped to the best match from all routes.
- A route contains a URL pattern that is mapped to a handler.
- A URL pattern is mapped to the first route that matches the pattern.

**Answer:**

- Routes do not map to specific files.
- A route contains a URL pattern that is mapped to a handler.
- A URL pattern is mapped to the first route that matches the pattern.

---

## ANSI SQL:2011

### 1. Aggregate function in `WHERE`

**Question:** Given numeric table `T(ID1, ID2)`, identify the error:

```sql
SELECT SUM(id1)
FROM t
WHERE MIN(id2) = (SELECT MIN(id1) FROM t);
```

**Options:**

- Aggregate functions in a `WHERE` clause must be the same as in the `SELECT` list.
- Aggregate functions are not allowed in a `WHERE` clause.
- A subquery in the `WHERE` predicate must be correlated.
- Aggregate functions are not allowed in a subquery.
- A subquery is not allowed in a `WHERE` clause.

**Answer:** Aggregate functions are not allowed in a `WHERE` clause.

### 2. `ORDER_DETAILS` aggregate queries

**Question:** Based on this table structure, which ANSI SQL queries execute
without error?

```text
ORDER_ID    NUMBER
PRODUCT_ID  NUMBER
QTY1        NUMBER
QTY2        NUMBER
PRICE       NUMBER
ORDER_DATE  DATE
ORDER_DOC   CLOB
```

**Options:**

- `SELECT MAX(order_doc) FROM order_details;`
- `SELECT MIN(order_date) FROM order_details;`
- `SELECT COUNT(*) FROM order_details;`
- `SELECT SUM(AVG(qty1)) FROM order_details;`
- `SELECT SUM(qty1, qty2) FROM order_details;`

**Answer:**

- `SELECT MIN(order_date) FROM order_details;`
- `SELECT COUNT(*) FROM order_details;`

### 3. Invalid predicate conditions

**Question:** Assuming `TAB1` has an integer column `COL1`, which are invalid
ANSI SQL predicate conditions?

**Options:**

- `WHERE col1 IN (1,2,3)`
- `WHERE col1 IS UNIQUE`
- `WHERE col1 EXISTS`
- `WHERE col1 > 100`
- `WHERE col1 BETWEEN 100 AND 200`

**Answer:**

- `WHERE col1 IS UNIQUE`
- `WHERE col1 EXISTS`

### 4. `DISTINCT`, `WHERE`, and `ORDER BY` errors

**Question:** Which options identify errors in the query below?

```sql
SELECT first_name, DISTINCT department_id
FROM employees
ORDER BY first_name
WHERE salary > 1000
```

**Options:**

- The `DISTINCT` keyword, if used in a `SELECT`, cannot be applied on individual columns.
- Sorting data should be based on numeric columns only.
- The `WHERE` clause should appear before the `ORDER BY` clause.
- The column used in the query predicate should be one of the selected columns.
- The `DISTINCT` keyword cannot be used with queries selecting more than one column.

**Answer:**

- The `DISTINCT` keyword, if used in a `SELECT`, cannot be applied on individual columns.
- The `WHERE` clause should appear before the `ORDER BY` clause.

### 5. `GROUP BY` usage

**Question:** Which statements correctly describe the `GROUP BY` clause in ANSI
SQL?

**Options:**

- It is used to summarize the grouped data with a function.
- It does not sort the data.
- It is a mandatory clause in a `SELECT` statement.
- It can be used together with `JOIN` in a query.
- It can be used on a maximum of one column.

**Answer:**

- It is used to summarize the grouped data with a function.
- It does not sort the data.
- It can be used together with `JOIN` in a query.

### 6. Customers in GA/AL not zip 35244

**Question:** Which statement retrieves last names of customers who live in
Georgia (`GA`) or Alabama (`AL`) but do not have zip code `35244`?

**Options:**

- `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') AND NOT zip = '35244'`
- `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') AND zip NOT = '35244'`
- `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') OR zip != '35244'`
- `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') AND zip != '35244'`
- `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') NOT zip = '35244'`

**Answer:** `SELECT last_name FROM customers WHERE state IN ('AL', 'GA') AND zip != '35244'`

### 7. Award students with scores greater than 80

**Question:** Which lines substitute `*****`?

```sql
SELECT student_id, max(score)
FROM grades
*****
ORDER BY student_id
```

**Options:**

- `HAVING score > 80` then `GROUP BY student_id`
- `WHERE score > 80` then `GROUP BY student_id`
- `WHERE max(score) > 80` then `GROUP BY student_id`
- `GROUP BY student_id` then `HAVING max(score) > 80`
- `GROUP BY student_id` then `WHERE max(score) > 80`

**Answer:**

```sql
GROUP BY student_id
HAVING max(score) > 80
```

### 8. Sum expressions

**Question:** Table `T` has:

```text
ID1  ID2
1    4
5    1
7    2
3    8
```

What is the output?

```sql
-- Query 1
SELECT SUM(id1 - id2) FROM t;

-- Query 2
SELECT SUM(id1) - SUM(id2) FROM t;
```

**Options:**

- Query-2 returns 1.
- Query-1 and Query-2 return `NULL`.
- Query-1 returns 6.
- Query-2 returns 6.
- Query-1 returns 1.

**Answer:**

- Query-1 returns 1.
- Query-2 returns 1.

---

## DevOps / Git

### 1. Continuous integration disadvantage

**Question:** Which statement describes a disadvantage of using continuous
integration?

**Options:**

- More prone to software bugs, since the process is automated and the developer is not involved.
- Requires more work from the developer, since all units of code must have matching automated tests written.
- Requires more human resources since an Integrations Officer must be appointed.
- Requires developers to learn external testing services.
- Requires complex Docker configurations.

**Answer:** Requires more work from the developer, since all units of code must have matching automated tests written.

### 2. DevOps principles for working software

**Question:** Which statements describe DevOps principles ensuring the team
deploys well-built, working software?

**Options:**

- Ensure the team accepts any infrastructure change requirements.
- Ensure management clarifies unclear requirements.
- Ensure the team meets regularly to improve team processes and hold them to it.
- Aggregate logging into a central location to improve troubleshooting response time.
- Implement monitoring and alerting of application errors to identify issues early.

**Answer:**

- Aggregate logging into a central location to improve troubleshooting response time.
- Implement monitoring and alerting of application errors to enable developers to identify issues early in the lifecycle.

### 3. Typical uses of Git tags

**Question:** Which statements describe typical uses of Git tags?

**Options:**

- Assigned to all Git commits to provide a human-friendly description.
- Provide a meaningful name to a specific commit.
- Mechanism used by code reviewers to mark unacceptable changes.
- Assign version numbers for a given state of the source code.
- Used by the developer to mark files ready to be committed.

**Answer:**

- Provide a meaningful name to a specific commit.
- Assign version numbers for a given state of the source code.

### 4. DevOps practice for faster code revision feedback

**Question:** Which DevOps practice improves turnaround time on revising code
changes while implementing features and bug fixes?

**Options:**

- Automated application deploys changes quickly and easily to production.
- Configuration management enforces compliance and audits system changes.
- Continuous monitoring of resources ensures service meets target specification.
- Continuous integration provides rapid feedback on correctness of changes.
- Continuous delivery reduces time required to release latest build artifact.

**Answer:** Continuous integration provides rapid feedback on the correctness of the changes.

### 5. MVC/DevOps QA practices

**Question:** Which practices are adopted by QA in a DevOps project?

**Options:**

- Report errors and issues continuously as they are found.
- Need a few days to verify correctness before signing off a release.
- Coordinate with operations to ensure testing environment is prepared.
- Modify production deployment scripts to suit testing scenarios.
- Automate environment setup and testing procedure.

**Answer:**

- Report errors and issues continuously as they are found.
- Coordinate with operations to ensure the testing environment is prepared in time for testing.
- Automate the environment setup and testing procedure.

### 6. Continuous deployment disadvantages

**Question:** Which statements describe disadvantages of continuous deployment?

**Options:**

- Requires open SSH ports in production.
- Requires more frequent team lead involvement for scheduled deployments.
- Requires bigger engineering effort and ongoing maintenance.
- Requires production to use containers, impossible for legacy systems.
- Can cause untested features to reach production because deployment is automatic.

**Answer:**

- Requires a bigger engineering effort and ongoing maintenance, compared to other deployment methods.
- Can cause untested features to find their way to production, since deployment is automatic.

### 7. Typical uses of `git diff`

**Question:** Which statements describe typical uses of `git diff`?

**Options:**

- Show content differences between files in two different commits.
- Show a list of files that exist in one Git repository but not another.
- Show content differences between files in the working directory and committed repository.
- Show differences between a local and remote repository.
- Highlight changes so other developers know what changed.

**Answer:**

- Used to show content differences between files in two different commits.
- Shows content differences between files in the working directory and the committed repository.

### 8. Revert uncommitted changes to one file

**Question:** Which Git command reverts uncommitted changes to a single file?

**Options:**

- `git discard <filename>`
- `git checkout <filename>`
- `git revert <filename>`
- `git reset <filename>`
- `git clean <filename>`

**Answer:** `git checkout <filename>`

### 9. Feedback tools for application-level errors

**Question:** Which feedback measurement tools assist in finding and resolving
application-level errors?

**Options:**

- Stack trace reporting
- User usage metrics and analytics
- Performance metrics monitoring
- Node failure rate alerting
- Service uptime monitoring

**Answer:**

- Stack trace reporting
- Node failure rate alerting

---

## Mixed C# review questions from later screenshots

### 1. LINQ standard providers

**Question:** Which entities can LINQ use to perform queries with the standard
LINQ providers in C#?

**Options:**

- DataTables
- In-memory collections
- Bitmaps
- Source code
- XML documents

**Answer:**

- DataTables
- In-memory collections
- XML documents

### 2. Interfaces can contain

**Question:** Which options describe what C# interfaces can contain?

**Options:**

- Constructor method definitions
- Static properties without getters or setters
- Method definitions
- Fully implemented methods
- Method definitions that must not be implemented

**Answer:**

- Method definitions
- Fully implemented methods

### 3. `Take` and `TakeWhile`

**Question:** Which statements correctly describe C# LINQ partitioning methods
`Take` and `TakeWhile`?

**Options:**

- `TakeWhile` takes an integer parameter.
- `TakeWhile` takes a function as a parameter.
- `Take` takes a function as a parameter.
- Both `Take` and `TakeWhile` return an array of booleans.
- `Take` takes an integer parameter.

**Answer:**

- `TakeWhile` takes a function as a parameter.
- `Take` takes an integer parameter.

### 4. Disposable object types

**Question:** To avoid memory leaks, which C# object types must be disposed of
explicitly before a class is destroyed?

**Options:**

- `System.Text.StringBuilder`
- `System.Array`
- `System.IO.FileStream`
- `System.Data.SqlClient.SqlConnection`
- `System.Drawing.StringBuilder`

**Answer:**

- `System.IO.FileStream`
- `System.Data.SqlClient.SqlConnection`

### 5. Thread usage statements

**Question:** Which statement is correct regarding the use of threads in C#?

**Options:**

- One thread can call `Thread.Sleep` on another thread.
- The `Thread.Destroy` method permanently stops a managed thread.
- The `Thread` class has constructors that take a `ThreadStart` or `ParameterizedThreadStart` delegate.
- `Thread.Start` can be called more than once without `ThreadStateException`.
- `ParameterizedThreadStart` is type-safe.

**Answer:** The `Thread` class has constructors that take a `ThreadStart` delegate or a `ParameterizedThreadStart` delegate.

### 6. Polymorphism examples

**Question:** Which options are examples of polymorphism in C#?

**Options:**

- A method taking a parameter whose type is a sealed class.
- A method taking a parameter whose type is a static class.
- A method taking a parameter whose type is a reflection class.
- A method taking a parameter whose type is an abstract class.
- A method taking a parameter whose type is an interface.

**Answer:**

- A method taking a parameter whose type is an abstract class.
- A method taking a parameter whose type is an interface.

### 7. Dictionary value retrieval

**Question:** Which methods retrieve the object with key `XYZ` from this C#
collection?

```csharp
Dictionary<string, object> items = new Dictionary<string, object>();
```

**Options:**

- `object item = items.Get("XYZ");`
- `object item = items.GetValue("XYZ");`
- `object item = items["XYZ"];`
- `object item; items.GetValue("XYZ", out item);`
- `object item; items.TryGetValue("XYZ", out item);`

**Answer:**

- `object item = items["XYZ"];`
- `object item; items.TryGetValue("XYZ", out item);`
