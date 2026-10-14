<!-- markdownlint-disable -->

# CODING PATTERNS REFERENCE
### Ntokozo Banda's War Room Practice Reference
**14 Patterns · 42 Problems · Full Solutions**

Offline reference for War Room Pattern Drill mode. Use this to practice recognition, implement from memory, and verify against full C# solutions.

## HOW TO USE
- Set a **20-minute timer** before opening any solution.
- If stuck at the 10-minute mark, read the **hint only** first.
- Then finish the implementation from memory before checking code.
- After review, re-code the same pattern once more without looking.

---

## Pattern 1: HashMap / Frequency Count
**Recognition Trigger**
- Need O(1) lookup while scanning once
- Need counts, complements, or seen-state tracking
- Nested loop can be replaced by value->index/value->count map

**Why it works**
- A hash map stores what you have already processed so every element can be resolved in average O(1) time. This converts brute-force pair checking into one linear pass and is especially strong when you need complements, frequencies, or quick membership checks.

### Problem A: Two Sum
- Input: `nums = [2,7,11,15], target = 9`
- Output: `[0,1]`

```csharp
int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>();

    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];
        if (seen.TryGetValue(complement, out int j))
        {
            return [j, i];
        }

        seen[nums[i]] = i;
    }

    return [-1, -1];
}
```

### Problem B: Group Anagrams
- Input: `strs = ["eat","tea","tan","ate","nat","bat"]`
- Output: `[["eat","tea","ate"],["tan","nat"],["bat"]]`
- HINT: Use a normalized signature key (sorted letters or frequency tuple).

```csharp
IList<IList<string>> GroupAnagrams(string[] strs)
{
    var map = new Dictionary<string, List<string>>();

    foreach (var s in strs)
    {
        char[] chars = s.ToCharArray();
        Array.Sort(chars);
        string key = new string(chars);

        if (!map.ContainsKey(key))
        {
            map[key] = [];
        }

        map[key].Add(s);
    }

    return map.Values.Select(g => (IList<string>)g).ToList();
}
```

### Problem C: First Non-Repeating Character
- Input: `s = "leetcode"`
- Output: `0`
- HINT: Count frequencies first, then scan for first char with count 1.

```csharp
int FirstUniqChar(string s)
{
    var freq = new Dictionary<char, int>();

    foreach (char c in s)
    {
        freq[c] = freq.GetValueOrDefault(c) + 1;
    }

    for (int i = 0; i < s.Length; i++)
    {
        if (freq[s[i]] == 1)
        {
            return i;
        }
    }

    return -1;
}
```

---

## Pattern 2: Two Pointers
**Recognition Trigger**
- Input is linear (array/string) with left/right decisions
- Sorted input enables shrinking search space
- Need pair/cleanup/comparison without extra memory

**Why it works**
- Two pointers maintain a small moving state from both ends (or fast/slow within one pass). By moving only the pointer that can improve the result, you avoid redundant rescans and often reduce O(n^2) work to O(n).

### Problem A: Valid Palindrome
- Input: `s = "A man, a plan, a canal: Panama"`
- Output: `true`

```csharp
bool IsPalindrome(string s)
{
    int left = 0;
    int right = s.Length - 1;

    while (left < right)
    {
        while (left < right && !char.IsLetterOrDigit(s[left])) left++;
        while (left < right && !char.IsLetterOrDigit(s[right])) right--;

        if (char.ToLowerInvariant(s[left]) != char.ToLowerInvariant(s[right]))
        {
            return false;
        }

        left++;
        right--;
    }

    return true;
}
```

### Problem B: Two Sum II - Input Array Is Sorted
- Input: `numbers = [2,7,11,15], target = 9`
- Output: `[1,2]`
- HINT: If sum is too small move left; if too large move right.

```csharp
int[] TwoSum(int[] numbers, int target)
{
    int left = 0;
    int right = numbers.Length - 1;

    while (left < right)
    {
        int sum = numbers[left] + numbers[right];
        if (sum == target) return [left + 1, right + 1];
        if (sum < target) left++;
        else right--;
    }

    return [-1, -1];
}
```

### Problem C: Remove Duplicates from Sorted Array
- Input: `nums = [0,0,1,1,1,2,2,3,3,4]`
- Output: `5`
- HINT: Use write pointer for next unique position.

```csharp
int RemoveDuplicates(int[] nums)
{
    if (nums.Length == 0) return 0;

    int write = 1;
    for (int read = 1; read < nums.Length; read++)
    {
        if (nums[read] != nums[read - 1])
        {
            nums[write] = nums[read];
            write++;
        }
    }

    return write;
}
```

---

## Pattern 3: Sliding Window
**Recognition Trigger**
- Need best/shortest/longest contiguous segment
- Window validity can be tracked incrementally
- Recomputing every subarray is too expensive

**Why it works**
- Sliding window reuses previous computation when expanding or shrinking boundaries. Instead of starting from scratch for each index, it keeps a rolling state and updates in O(1), leading to linear-time scans for many substring/subarray constraints.

### Problem A: Maximum Sum Subarray of Size K
- Input: `nums = [2,1,5,1,3,2], k = 3`
- Output: `9`

```csharp
int MaxSumSubarrayOfSizeK(int[] nums, int k)
{
    if (nums.Length < k) return 0;

    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += nums[i];

    int best = windowSum;
    for (int right = k; right < nums.Length; right++)
    {
        windowSum += nums[right] - nums[right - k];
        best = Math.Max(best, windowSum);
    }

    return best;
}
```

### Problem B: Longest Substring Without Repeating Characters
- Input: `s = "abcabcbb"`
- Output: `3`
- HINT: When duplicate appears, move left pointer past previous index.

```csharp
int LengthOfLongestSubstring(string s)
{
    var indexMap = new Dictionary<char, int>();
    int left = 0;
    int best = 0;

    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        if (indexMap.TryGetValue(c, out int prev) && prev >= left)
        {
            left = prev + 1;
        }

        indexMap[c] = right;
        best = Math.Max(best, right - left + 1);
    }

    return best;
}
```

### Problem C: Minimum Window Substring
- Input: `s = "ADOBECODEBANC", t = "ABC"`
- Output: `"BANC"`
- HINT: Expand to satisfy counts, then shrink while still valid.

```csharp
string MinWindow(string s, string t)
{
    if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(t)) return "";

    var need = new Dictionary<char, int>();
    foreach (char c in t) need[c] = need.GetValueOrDefault(c) + 1;

    int missing = t.Length;
    int left = 0;
    int bestStart = 0;
    int bestLen = int.MaxValue;

    for (int right = 0; right < s.Length; right++)
    {
        char c = s[right];
        if (need.GetValueOrDefault(c) > 0) missing--;
        need[c] = need.GetValueOrDefault(c) - 1;

        while (missing == 0)
        {
            int len = right - left + 1;
            if (len < bestLen)
            {
                bestLen = len;
                bestStart = left;
            }

            char lc = s[left];
            need[lc] = need.GetValueOrDefault(lc) + 1;
            if (need[lc] > 0) missing++;
            left++;
        }
    }

    return bestLen == int.MaxValue ? "" : s.Substring(bestStart, bestLen);
}
```

---

## Pattern 4: Binary Search
**Recognition Trigger**
- Search space is sorted or monotonic
- Feasibility check lets you discard half
- Need faster than linear scan

**Why it works**
- Binary search halves the candidate range every step based on ordered structure. This gives O(log n) lookup for sorted arrays and also powers answer-space search for monotonic decision problems.

### Problem A: Classic Binary Search
- Input: `nums = [-1,0,3,5,9,12], target = 9`
- Output: `4`

```csharp
int Search(int[] nums, int target)
{
    int left = 0;
    int right = nums.Length - 1;

    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }

    return -1;
}
```

### Problem B: Search in Rotated Sorted Array
- Input: `nums = [4,5,6,7,0,1,2], target = 0`
- Output: `4`
- HINT: One side is always sorted; decide if target is inside that side.

```csharp
int SearchRotated(int[] nums, int target)
{
    int left = 0;
    int right = nums.Length - 1;

    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;

        if (nums[left] <= nums[mid])
        {
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        }
        else
        {
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }

    return -1;
}
```

### Problem C: Find First and Last Position of Element in Sorted Array
- Input: `nums = [5,7,7,8,8,10], target = 8`
- Output: `[3,4]`
- HINT: Use lower-bound binary search twice: target and target + 1.

```csharp
int[] SearchRange(int[] nums, int target)
{
    int left = LowerBound(nums, target);
    if (left == nums.Length || nums[left] != target) return [-1, -1];
    int right = LowerBound(nums, target + 1) - 1;
    return [left, right];
}

int LowerBound(int[] nums, int target)
{
    int left = 0;
    int right = nums.Length;

    while (left < right)
    {
        int mid = left + (right - left) / 2;
        if (nums[mid] < target) left = mid + 1;
        else right = mid;
    }

    return left;
}
```

---

## Pattern 5: Stack
**Recognition Trigger**
- Need last-in-first-out matching or rollback
- Parentheses/nesting/monotonic-next problems
- Most recent unresolved item drives next decision

**Why it works**
- A stack keeps unresolved states in strict LIFO order, so push/pop operations naturally mirror nested or sequential dependencies. This often turns repeated backward scans into one pass.

### Problem A: Valid Parentheses
- Input: `s = "()[]{}"`
- Output: `true`

```csharp
bool IsValid(string s)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char>
    {
        [')'] = '(',
        [']'] = '[',
        ['}'] = '{',
    };

    foreach (char c in s)
    {
        if (c == '(' || c == '[' || c == '{')
        {
            stack.Push(c);
        }
        else
        {
            if (stack.Count == 0 || stack.Pop() != pairs[c]) return false;
        }
    }

    return stack.Count == 0;
}
```

### Problem B: Daily Temperatures
- Input: `temps = [73,74,75,71,69,72,76,73]`
- Output: `[1,1,4,2,1,1,0,0]`
- HINT: Use decreasing stack of indices; resolve when warmer day arrives.

```csharp
int[] DailyTemperatures(int[] temperatures)
{
    int n = temperatures.Length;
    int[] answer = new int[n];
    var stack = new Stack<int>();

    for (int i = 0; i < n; i++)
    {
        while (stack.Count > 0 && temperatures[i] > temperatures[stack.Peek()])
        {
            int j = stack.Pop();
            answer[j] = i - j;
        }
        stack.Push(i);
    }

    return answer;
}
```

### Problem C: Evaluate Reverse Polish Notation
- Input: `tokens = ["2","1","+","3","*"]`
- Output: `9`
- HINT: Push numbers; on operator pop two, compute, and push result.

```csharp
int EvalRPN(string[] tokens)
{
    var stack = new Stack<int>();

    foreach (string t in tokens)
    {
        if (t is "+" or "-" or "*" or "/")
        {
            int b = stack.Pop();
            int a = stack.Pop();
            stack.Push(t switch
            {
                "+" => a + b,
                "-" => a - b,
                "*" => a * b,
                _ => a / b,
            });
        }
        else
        {
            stack.Push(int.Parse(t));
        }
    }

    return stack.Pop();
}
```

---

## Pattern 6: Prefix Sum
**Recognition Trigger**
- Need many range sum queries
- Need subarray totals derived from cumulative sums
- Want O(1) range retrieval after preprocessing

**Why it works**
- Prefix sums transform repeated range computations into subtraction of cumulative totals. Combined with a hash map of seen prefixes, they also solve subarray-equals-target counting in linear time.

### Problem A: Range Sum Query
- Input: `nums = [-2,0,3,-5,2,-1], sumRange(0,2), sumRange(2,5)`
- Output: `1, -1`

```csharp
class NumArray
{
    private readonly int[] _pref;

    public NumArray(int[] nums)
    {
        _pref = new int[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++)
        {
            _pref[i + 1] = _pref[i] + nums[i];
        }
    }

    public int SumRange(int left, int right)
    {
        return _pref[right + 1] - _pref[left];
    }
}
```

### Problem B: Subarray Sum Equals K
- Input: `nums = [1,1,1], k = 2`
- Output: `2`
- HINT: If prefix is p now, previous (p-k) prefixes complete valid subarrays.

```csharp
int SubarraySum(int[] nums, int k)
{
    var freq = new Dictionary<int, int> { [0] = 1 };
    int prefix = 0;
    int count = 0;

    foreach (int n in nums)
    {
        prefix += n;
        if (freq.TryGetValue(prefix - k, out int f))
        {
            count += f;
        }
        freq[prefix] = freq.GetValueOrDefault(prefix) + 1;
    }

    return count;
}
```

### Problem C: Product of Array Except Self
- Input: `nums = [1,2,3,4]`
- Output: `[24,12,8,6]`
- HINT: Accumulate left products then multiply by running right product.

```csharp
int[] ProductExceptSelf(int[] nums)
{
    int n = nums.Length;
    int[] answer = new int[n];
    answer[0] = 1;

    for (int i = 1; i < n; i++)
    {
        answer[i] = answer[i - 1] * nums[i - 1];
    }

    int suffix = 1;
    for (int i = n - 1; i >= 0; i--)
    {
        answer[i] *= suffix;
        suffix *= nums[i];
    }

    return answer;
}
```

---

## Pattern 7: Fast and Slow Pointers
**Recognition Trigger**
- Need cycle detection or midpoint in linked/iterative sequences
- One pointer can move at 2x speed
- Need O(1) memory without visited set

**Why it works**
- Relative speed creates predictable meetings in cycles and clean midpoint discovery in linear structures. This gives cycle/middle solutions in O(n) time with constant extra space.

### Problem A: Linked List Cycle
- Input: `head = [3,2,0,-4], pos = 1`
- Output: `true`

```csharp
bool HasCycle(ListNode head)
{
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }

    return false;
}
```

### Problem B: Find Middle of Linked List
- Input: `head = [1,2,3,4,5]`
- Output: `node 3`
- HINT: Advance fast by 2 and slow by 1.

```csharp
ListNode MiddleNode(ListNode head)
{
    ListNode slow = head;
    ListNode fast = head;

    while (fast != null && fast.next != null)
    {
        slow = slow.next;
        fast = fast.next.next;
    }

    return slow;
}
```

### Problem C: Happy Number
- Input: `n = 19`
- Output: `true`
- HINT: Treat next(n) as pointer transition and run Floyd cycle detection.

```csharp
bool IsHappy(int n)
{
    int slow = n;
    int fast = n;

    do
    {
        slow = Next(slow);
        fast = Next(Next(fast));
    } while (slow != fast);

    return slow == 1;
}

int Next(int x)
{
    int sum = 0;
    while (x > 0)
    {
        int d = x % 10;
        sum += d * d;
        x /= 10;
    }
    return sum;
}
```

---

## Pattern 8: Recursion and DFS
**Recognition Trigger**
- Structure is tree/graph/backtracking search space
- Natural definition uses smaller subproblems
- Need full traversal with path-based state

**Why it works**
- Recursion maps naturally to hierarchical data and DFS explores one branch to completion before backtracking. This keeps state transitions explicit and makes exhaustive traversal/backtracking concise.

### Problem A: Maximum Depth of Binary Tree
- Input: `root = [3,9,20,null,null,15,7]`
- Output: `3`

```csharp
int MaxDepth(TreeNode root)
{
    if (root == null) return 0;
    return 1 + Math.Max(MaxDepth(root.left), MaxDepth(root.right));
}
```

### Problem B: Generate All Subsets
- Input: `nums = [1,2,3]`
- Output: `[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]`
- HINT: At each index choose include vs exclude and recurse.

```csharp
IList<IList<int>> Subsets(int[] nums)
{
    var result = new List<IList<int>>();
    var path = new List<int>();

    void Dfs(int i)
    {
        if (i == nums.Length)
        {
            result.Add([.. path]);
            return;
        }

        Dfs(i + 1);

        path.Add(nums[i]);
        Dfs(i + 1);
        path.RemoveAt(path.Count - 1);
    }

    Dfs(0);
    return result;
}
```

### Problem C: Number of Islands
- Input: `grid = [["1","1","0"],["1","0","0"],["0","0","1"]]`
- Output: `2`
- HINT: When land is found, DFS flood-fill to mark the whole island visited.

```csharp
int NumIslands(char[][] grid)
{
    int rows = grid.Length;
    int cols = grid[0].Length;
    int count = 0;

    for (int r = 0; r < rows; r++)
    {
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] == '1')
            {
                count++;
                Dfs(r, c);
            }
        }
    }

    return count;

    void Dfs(int r, int c)
    {
        if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0';
        Dfs(r + 1, c);
        Dfs(r - 1, c);
        Dfs(r, c + 1);
        Dfs(r, c - 1);
    }
}
```

---

## Pattern 9: Dynamic Programming
**Recognition Trigger**
- Optimal answer built from overlapping subproblems
- Brute force revisits same states repeatedly
- Clear recurrence and base cases exist

**Why it works**
- DP caches solutions to subproblems so each state is solved once. This turns exponential recursive branching into polynomial or linear time depending on state design.

### Problem A: Climbing Stairs
- Input: `n = 5`
- Output: `8`

```csharp
int ClimbStairs(int n)
{
    if (n <= 2) return n;

    int a = 1;
    int b = 2;
    for (int i = 3; i <= n; i++)
    {
        int next = a + b;
        a = b;
        b = next;
    }

    return b;
}
```

### Problem B: House Robber
- Input: `nums = [2,7,9,3,1]`
- Output: `12`
- HINT: State transition: best at i = max(skip i, take i).

```csharp
int Rob(int[] nums)
{
    int robPrev = 0;
    int skipPrev = 0;

    foreach (int n in nums)
    {
        int newRob = skipPrev + n;
        int newSkip = Math.Max(skipPrev, robPrev);
        robPrev = newRob;
        skipPrev = newSkip;
    }

    return Math.Max(robPrev, skipPrev);
}
```

### Problem C: Longest Common Subsequence
- Input: `text1 = "abcde", text2 = "ace"`
- Output: `3`
- HINT: 2D DP: match -> diagonal + 1, else max(top, left).

```csharp
int LongestCommonSubsequence(string text1, string text2)
{
    int m = text1.Length;
    int n = text2.Length;
    int[,] dp = new int[m + 1, n + 1];

    for (int i = m - 1; i >= 0; i--)
    {
        for (int j = n - 1; j >= 0; j--)
        {
            if (text1[i] == text2[j])
            {
                dp[i, j] = 1 + dp[i + 1, j + 1];
            }
            else
            {
                dp[i, j] = Math.Max(dp[i + 1, j], dp[i, j + 1]);
            }
        }
    }

    return dp[0, 0];
}
```

---

## Pattern 10: Merge Intervals
**Recognition Trigger**
- Input is a list of ranges
- Need merge/insert/room overlap decisions
- Sorting by start or end unlocks linear scan

**Why it works**
- Once intervals are ordered, overlap relationships become local. You can compare only with the current merged interval (or next ending interval), enabling efficient O(n log n) sorting + O(n) processing.

### Problem A: Merge Intervals
- Input: `intervals = [[1,3],[2,6],[8,10],[15,18]]`
- Output: `[[1,6],[8,10],[15,18]]`

```csharp
int[][] Merge(int[][] intervals)
{
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var merged = new List<int[]>();

    foreach (var interval in intervals)
    {
        if (merged.Count == 0 || merged[^1][1] < interval[0])
        {
            merged.Add([interval[0], interval[1]]);
        }
        else
        {
            merged[^1][1] = Math.Max(merged[^1][1], interval[1]);
        }
    }

    return [.. merged];
}
```

### Problem B: Meeting Rooms II
- Input: `intervals = [[0,30],[5,10],[15,20]]`
- Output: `2`
- HINT: Sort starts and ends separately and sweep with two pointers.

```csharp
int MinMeetingRooms(int[][] intervals)
{
    int n = intervals.Length;
    int[] starts = new int[n];
    int[] ends = new int[n];

    for (int i = 0; i < n; i++)
    {
        starts[i] = intervals[i][0];
        ends[i] = intervals[i][1];
    }

    Array.Sort(starts);
    Array.Sort(ends);

    int rooms = 0;
    int maxRooms = 0;
    int s = 0;
    int e = 0;

    while (s < n)
    {
        if (starts[s] < ends[e])
        {
            rooms++;
            maxRooms = Math.Max(maxRooms, rooms);
            s++;
        }
        else
        {
            rooms--;
            e++;
        }
    }

    return maxRooms;
}
```

### Problem C: Insert Interval
- Input: `intervals = [[1,3],[6,9]], newInterval = [2,5]`
- Output: `[[1,5],[6,9]]`
- HINT: Add non-overlapping left part, merge overlap block, append right part.

```csharp
int[][] Insert(int[][] intervals, int[] newInterval)
{
    var result = new List<int[]>();
    int i = 0;
    int n = intervals.Length;

    while (i < n && intervals[i][1] < newInterval[0])
    {
        result.Add(intervals[i]);
        i++;
    }

    while (i < n && intervals[i][0] <= newInterval[1])
    {
        newInterval[0] = Math.Min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.Max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.Add([newInterval[0], newInterval[1]]);

    while (i < n)
    {
        result.Add(intervals[i]);
        i++;
    }

    return [.. result];
}
```

---

## Pattern 11: Linked List Operations
**Recognition Trigger**
- Need pointer rewiring (reverse/remove/merge)
- In-place node manipulation is required
- Array conversion is unnecessary or costly

**Why it works**
- Linked list operations are about pointer updates. Using dummy nodes and controlled pointer movement avoids index complexity and enables one-pass in-place transformations with O(1) auxiliary space.

### Problem A: Reverse Linked List
- Input: `head = [1,2,3,4,5]`
- Output: `[5,4,3,2,1]`

```csharp
ListNode ReverseList(ListNode head)
{
    ListNode prev = null;
    ListNode cur = head;

    while (cur != null)
    {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }

    return prev;
}
```

### Problem B: Remove Nth Node From End of List
- Input: `head = [1,2,3,4,5], n = 2`
- Output: `[1,2,3,5]`
- HINT: Maintain gap of n nodes between fast and slow pointers.

```csharp
ListNode RemoveNthFromEnd(ListNode head, int n)
{
    var dummy = new ListNode(0, head);
    ListNode fast = dummy;
    ListNode slow = dummy;

    for (int i = 0; i < n; i++) fast = fast.next;

    while (fast.next != null)
    {
        fast = fast.next;
        slow = slow.next;
    }

    slow.next = slow.next.next;
    return dummy.next;
}
```

### Problem C: Merge Two Sorted Lists
- Input: `l1 = [1,2,4], l2 = [1,3,4]`
- Output: `[1,1,2,3,4,4]`
- HINT: Use a dummy head to append the smaller current node each step.

```csharp
ListNode MergeTwoLists(ListNode list1, ListNode list2)
{
    var dummy = new ListNode(0);
    var tail = dummy;

    while (list1 != null && list2 != null)
    {
        if (list1.val <= list2.val)
        {
            tail.next = list1;
            list1 = list1.next;
        }
        else
        {
            tail.next = list2;
            list2 = list2.next;
        }

        tail = tail.next;
    }

    tail.next = list1 ?? list2;
    return dummy.next;
}
```

---

## Pattern 12: Heap / Priority Queue
**Recognition Trigger**
- Repeatedly need smallest/largest item
- Top-k tracking under streaming updates
- Sorted order is needed incrementally, not all at once

**Why it works**
- A heap maintains priority order under insert/remove in O(log n). This is ideal when only frontier extremes matter (kth, top-k, current minimum/maximum), avoiding full re-sorts.

### Problem A: Kth Largest Element
- Input: `nums = [3,2,1,5,6,4], k = 2`
- Output: `5`

```csharp
int FindKthLargest(int[] nums, int k)
{
    var pq = new PriorityQueue<int, int>();

    foreach (int n in nums)
    {
        pq.Enqueue(n, n);
        if (pq.Count > k) pq.Dequeue();
    }

    return pq.Peek();
}
```

### Problem B: Top K Frequent Elements
- Input: `nums = [1,1,1,2,2,3], k = 2`
- Output: `[1,2]`
- HINT: Count frequencies, then maintain min-heap of size k.

```csharp
int[] TopKFrequent(int[] nums, int k)
{
    var freq = new Dictionary<int, int>();
    foreach (int n in nums) freq[n] = freq.GetValueOrDefault(n) + 1;

    var pq = new PriorityQueue<int, int>();
    foreach (var kv in freq)
    {
        pq.Enqueue(kv.Key, kv.Value);
        if (pq.Count > k) pq.Dequeue();
    }

    var result = new int[k];
    for (int i = k - 1; i >= 0; i--)
    {
        result[i] = pq.Dequeue();
    }

    return result;
}
```

### Problem C: Merge K Sorted Lists
- Input: `lists = [[1,4,5],[1,3,4],[2,6]]`
- Output: `[1,1,2,3,4,4,5,6]`
- HINT: Push each list head into min-heap and repeatedly pop/advance.

```csharp
ListNode MergeKLists(ListNode[] lists)
{
    var pq = new PriorityQueue<ListNode, int>();

    foreach (var node in lists)
    {
        if (node != null) pq.Enqueue(node, node.val);
    }

    var dummy = new ListNode(0);
    var tail = dummy;

    while (pq.Count > 0)
    {
        var node = pq.Dequeue();
        tail.next = node;
        tail = tail.next;

        if (node.next != null)
        {
            pq.Enqueue(node.next, node.next.val);
        }
    }

    return dummy.next;
}
```

---

## Pattern 13: BFS
**Recognition Trigger**
- Need shortest path in unweighted graph
- Need level-order traversal
- Multi-source wave expansion from initial states

**Why it works**
- BFS explores nodes in increasing distance order using a queue. The first time a node/state is reached is guaranteed to be via the shortest number of edges/steps in unweighted settings.

### Problem A: Binary Tree Level Order
- Input: `root = [3,9,20,null,null,15,7]`
- Output: `[[3],[9,20],[15,7]]`

```csharp
IList<IList<int>> LevelOrder(TreeNode root)
{
    var result = new List<IList<int>>();
    if (root == null) return result;

    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);

    while (queue.Count > 0)
    {
        int size = queue.Count;
        var level = new List<int>(size);

        for (int i = 0; i < size; i++)
        {
            var node = queue.Dequeue();
            level.Add(node.val);
            if (node.left != null) queue.Enqueue(node.left);
            if (node.right != null) queue.Enqueue(node.right);
        }

        result.Add(level);
    }

    return result;
}
```

### Problem B: Rotting Oranges
- Input: `grid = [[2,1,1],[1,1,0],[0,1,1]]`
- Output: `4`
- HINT: Start BFS from all rotten cells at once (multi-source BFS).

```csharp
int OrangesRotting(int[][] grid)
{
    int rows = grid.Length;
    int cols = grid[0].Length;
    var queue = new Queue<(int r, int c)>();
    int fresh = 0;
    int minutes = 0;

    for (int r = 0; r < rows; r++)
    {
        for (int c = 0; c < cols; c++)
        {
            if (grid[r][c] == 2) queue.Enqueue((r, c));
            else if (grid[r][c] == 1) fresh++;
        }
    }

    int[][] dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (queue.Count > 0 && fresh > 0)
    {
        int size = queue.Count;
        for (int i = 0; i < size; i++)
        {
            var (r, c) = queue.Dequeue();
            foreach (var d in dirs)
            {
                int nr = r + d[0];
                int nc = c + d[1];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.Enqueue((nr, nc));
            }
        }
        minutes++;
    }

    return fresh == 0 ? minutes : -1;
}
```

### Problem C: Word Ladder
- Input: `begin=hit, end=cog, wordList=[hot,dot,dog,lot,log,cog]`
- Output: `5`
- HINT: BFS over one-letter transformations; remove visited words immediately.

```csharp
int LadderLength(string beginWord, string endWord, IList<string> wordList)
{
    var words = new HashSet<string>(wordList);
    if (!words.Contains(endWord)) return 0;

    var queue = new Queue<(string word, int dist)>();
    queue.Enqueue((beginWord, 1));
    words.Remove(beginWord);

    while (queue.Count > 0)
    {
        var (word, dist) = queue.Dequeue();
        if (word == endWord) return dist;

        char[] chars = word.ToCharArray();
        for (int i = 0; i < chars.Length; i++)
        {
            char original = chars[i];
            for (char ch = 'a'; ch <= 'z'; ch++)
            {
                if (ch == original) continue;
                chars[i] = ch;
                string next = new string(chars);
                if (words.Remove(next))
                {
                    queue.Enqueue((next, dist + 1));
                }
            }
            chars[i] = original;
        }
    }

    return 0;
}
```

---

## Pattern 14: Greedy
**Recognition Trigger**
- Local best choice can be justified globally
- Need linear decision without backtracking
- Exchange argument or invariant exists

**Why it works**
- Greedy algorithms commit to best local choices that preserve global optimality under a proven invariant. When that proof exists, they avoid expensive dynamic programming or brute-force exploration.

### Problem A: Jump Game
- Input: `nums = [2,3,1,1,4]`
- Output: `true`

```csharp
bool CanJump(int[] nums)
{
    int farthest = 0;

    for (int i = 0; i < nums.Length; i++)
    {
        if (i > farthest) return false;
        farthest = Math.Max(farthest, i + nums[i]);
    }

    return true;
}
```

### Problem B: Best Time to Buy and Sell Stock
- Input: `prices = [7,1,5,3,6,4]`
- Output: `5`
- HINT: Track minimum price so far and best profit at each day.

```csharp
int MaxProfit(int[] prices)
{
    int minPrice = int.MaxValue;
    int best = 0;

    foreach (int p in prices)
    {
        minPrice = Math.Min(minPrice, p);
        best = Math.Max(best, p - minPrice);
    }

    return best;
}
```

### Problem C: Assign Cookies
- Input: `g = [1,2,3], s = [1,1]`
- Output: `1`
- HINT: Sort both arrays and greedily fit smallest sufficient cookie first.

```csharp
int FindContentChildren(int[] g, int[] s)
{
    Array.Sort(g);
    Array.Sort(s);

    int child = 0;
    int cookie = 0;

    while (child < g.Length && cookie < s.Length)
    {
        if (s[cookie] >= g[child]) child++;
        cookie++;
    }

    return child;
}
```

---

## QUICK REFERENCE: Pattern Recognition Table

| Pattern | Use When You See |
|---|---|
| HashMap / Frequency Count | Complements, counts, seen values, duplicate checks |
| Two Pointers | Sorted arrays, palindrome compare, in-place left/right scanning |
| Sliding Window | Longest/shortest/best contiguous subarray/substring |
| Binary Search | Sorted/monotonic search space, need O(log n) |
| Stack | Matching pairs, nested structure, monotonic next greater/smaller |
| Prefix Sum | Many range sums, subarray sum counting |
| Fast and Slow Pointers | Cycle detection, middle of linked list, sequence loops |
| Recursion and DFS | Trees/graphs/backtracking with branch exploration |
| Dynamic Programming | Overlapping subproblems with recurrence |
| Merge Intervals | Overlap/merge/insert interval questions |
| Linked List Operations | Pointer rewiring, remove/reverse/merge list nodes |
| Heap / Priority Queue | Top-k, repeated min/max extraction |
| BFS | Shortest path in unweighted graph, level-order traversal |
| Greedy | Local optimal choice with provable global correctness |

---

## PRACTICE SCHEDULE (4 WEEKS)

### Week 1 - Core Foundations
- Day 1: Pattern 1 (HashMap) - A/B/C
- Day 2: Pattern 2 (Two Pointers) - A/B/C
- Day 3: Pattern 3 (Sliding Window) - A/B/C
- Day 4: Pattern 4 (Binary Search) - A/B/C
- Day 5: Timed mixed set from Patterns 1-4
- Day 6: Rewrite all A-problems from memory
- Day 7: Light review + error log cleanup

### Week 2 - Data Structure Flow
- Day 1: Pattern 5 (Stack) - A/B/C
- Day 2: Pattern 6 (Prefix Sum) - A/B/C
- Day 3: Pattern 7 (Fast and Slow Pointers) - A/B/C
- Day 4: Pattern 8 (Recursion and DFS) - A/B/C
- Day 5: Timed mixed set from Patterns 5-8
- Day 6: Rewrite all B-problems from memory
- Day 7: Review weak spots only

### Week 3 - Optimization Patterns
- Day 1: Pattern 9 (Dynamic Programming) - A/B/C
- Day 2: Pattern 10 (Merge Intervals) - A/B/C
- Day 3: Pattern 11 (Linked List Operations) - A/B/C
- Day 4: Pattern 12 (Heap / Priority Queue) - A/B/C
- Day 5: Timed mixed set from Patterns 9-12
- Day 6: Rewrite all C-problems from memory
- Day 7: Deep review of hardest 6 problems

### Week 4 - Graph + Interview Simulation
- Day 1: Pattern 13 (BFS) - A/B/C
- Day 2: Pattern 14 (Greedy) - A/B/C
- Day 3: Mixed set (any 6 problems, 20 minutes each)
- Day 4: Mock interview round 1 (3 random problems)
- Day 5: Mock interview round 2 (3 random problems)
- Day 6: Full 14-pattern recognition drill (no coding, trigger + approach only)
- Day 7: Final review and personal cheat-sheet refresh

---

Use this reference offline with Pattern Drill mode to force recognition speed, implementation recall, and interview endurance.
