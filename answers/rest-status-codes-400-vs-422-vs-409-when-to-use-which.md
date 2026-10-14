# REST Status Codes: 400 vs 422 vs 409 — When to Use Which

**Category:** API & Architecture · **Type:** Concept Comparison · **Difficulty:** Medium

> This question comes up constantly in senior API design interviews because it reveals whether a candidate truly understands REST semantics or just knows 'use 200 for success and 400 for errors.' In regulated systems like banking or insurance, incorrect status codes cause downstream consumers to mishandle errors — a payment service that returns 400 for a duplicate transaction might cause a client to retry and double-charge the customer. Interviewers use this question to separate engineers who've designed real APIs from those who've only consumed them.

## Question

Walk me through the difference between HTTP status codes 400 Bad Request, 422 Unprocessable Entity, and 409 Conflict. When should each be returned, and why does it matter which one you choose? I want to hear your reasoning, not just definitions — give me real examples of where you'd use each one in a production API.

## Hints

<details><summary>Hint 1</summary>

Think about what is actually wrong in each case — is it the shape of the request, the content of the request, or the state of the system?

</details>
<details><summary>Hint 2</summary>

Consider how a client library would handle each response differently — should it retry? Alert the developer? Show a message to the user?

</details>
<details><summary>Hint 3</summary>

The word 'Unprocessable' in 422 is key — the server processed the request enough to understand it, but could not execute the instructions inside it.

</details>

---

## Quick Answer

These three codes all represent client-side errors, but they communicate fundamentally different things. 400 means 'I cannot even parse or understand your request.' 422 means 'I understood your request perfectly, but the data inside it violates business rules.' 409 means 'Your request is valid, but it conflicts with the current state of the system.' Choosing the right one is not pedantry — it is your API's contract with its consumers, and the wrong code causes broken retry logic, duplicate transactions, and silent data corruption in production.

## Full Explanation

Think of it like a bank teller window.

--- 400 BAD REQUEST ---
You hand the teller a form written entirely in crayon with no account number field filled in — the form is structurally unusable. That is a 400. It means the server could not even begin to process the request because the shape of it is wrong: malformed JSON, missing required headers, an invalid URL parameter type (sending 'abc' where an integer is required). This is a PARSING or STRUCTURE failure. The client needs to fix the format of their request before retrying.

Example: POST /api/v1/transfers with a body of { 'amount': 'one hundred dollars' } — the amount field must be a number. Return 400.

--- 422 UNPROCESSABLE ENTITY ---
You hand the teller a perfectly filled-out form, the teller can read every field, but the rules say you cannot transfer more than your account balance. The form is fine. The data is coherent. But the business logic says NO. That is a 422. This is a SEMANTIC or BUSINESS RULE failure. The request was syntactically correct, but the contained instructions could not be followed because of domain validation. RFC 4918 (WebDAV) defined 422, and REST APIs adopted it widely for this exact purpose.

Example: POST /api/v1/transfers with { 'fromAccount': '12345', 'toAccount': '67890', 'amount': 50000.00 } — parsed fine, but fromAccount only has $200. Return 422 with a body explaining the validation failure.

--- 409 CONFLICT ---
You try to open a new account, but the bank already has an account registered to your SSN. Your request is valid and makes business sense — you just cannot do it right now because of the CURRENT STATE of the resource. That is a 409. This means there is a state collision. Common cases: trying to create a resource that already exists (duplicate email/ID), trying to update a record someone else just modified (optimistic locking failure), or trying to apply a state transition that is not allowed (e.g., cancelling an already-completed order).

Example: POST /api/v1/accounts with { 'email': 'jane@bank.com' } — but that email is already registered. Return 409 with a Location header pointing to the existing resource.

--- RETRY BEHAVIOR IS WHY THIS MATTERS ---
A well-designed client should:
- On 400: Stop and alert the developer. Do not retry. Fix the code.
- On 422: Stop and surface the validation error to the user. Do not retry with the same data.
- On 409: Decide based on context — maybe fetch the existing resource, maybe prompt the user to resolve the conflict. Do NOT blindly retry.

If you return 400 for everything, clients cannot distinguish 'my code is broken' from 'the user entered bad data' from 'there is a race condition.' That ambiguity causes bugs in production.

## Code Example

```
// Express.js API examples showing all three scenarios

// --- 400 BAD REQUEST: Structural / parsing failure ---
app.post('/api/v1/transfers', (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({
      error: 'BAD_REQUEST',
      message: 'Field `amount` must be a valid number.',
      field: 'amount'
    });
  }

  // --- 422 UNPROCESSABLE ENTITY: Business rule violation ---
  const account = getAccount(fromAccount);
  if (account.balance < amount) {
    return res.status(422).json({
      error: 'INSUFFICIENT_FUNDS',
      message: 'Transfer amount exceeds available balance.',
      availableBalance: account.balance,
      requestedAmount: amount
    });
  }

  // --- 409 CONFLICT: State collision (idempotency key already used) ---
  const idempotencyKey = req.headers['idempotency-key'];
  if (idempotencyKey && transferAlreadyProcessed(idempotencyKey)) {
    const existingTransfer = getTransferByKey(idempotencyKey);
    return res.status(409).json({
      error: 'DUPLICATE_TRANSFER',
      message: 'A transfer with this idempotency key was already processed.',
      existingTransferId: existingTransfer.id
    });
  }

  // Process the transfer...
  const transfer = processTransfer(fromAccount, toAccount, amount);
  return res.status(201).json(transfer);
});

// CLIENT-SIDE: How a smart client handles these differently
async function makeTransfer(payload) {
  const response = await fetch('/api/v1/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': uuid() },
    body: JSON.stringify(payload)
  });

  if (response.status === 400) {
    throw new DeveloperError('Fix the request format — do not retry');
  }
  if (response.status === 422) {
    const body = await response.json();
    throw new UserFacingError(body.message); // Show to user
  }
  if (response.status === 409) {
    const body = await response.json();
    return getTransfer(body.existingTransferId); // Return the existing one
  }
  return response.json();
}
```

## Real-World Scenario

At a digital bank, the payments team was seeing intermittent duplicate transfers. Investigation revealed their API was returning 400 for idempotency key conflicts. The mobile client's retry logic (which correctly retried on 400 thinking it was a network parsing issue) was resubmitting the payment. Fixing the response to 409 and updating the client to return the existing transfer instead of retrying eliminated the duplicates entirely. The status code was the contract, and the wrong code broke the contract silently. In automotive software, the same pattern appears when a vehicle configuration update conflicts with a currently-applied firmware version — 409 tells the caller to resolve the state mismatch before retrying.

## What Interviewers Want

Interviewers are testing whether you understand that HTTP status codes are a communication protocol between services — not just decorative numbers. They want to see: (1) that you know the semantic distinction between structural, semantic, and state-conflict errors; (2) that you understand downstream impact on retry logic and client behavior; (3) that you have actually designed APIs that others consumed, not just called APIs someone else built. Bonus points if you mention idempotency, RFC 7807 (Problem Details for HTTP APIs), or the relationship between 409 and optimistic locking in concurrent systems.

## Common Wrong Answers

- ⚠ Saying '400 covers all client errors, 422 is just for forms' — This shows you know the surface but not the semantics. 422 applies to any API with business rules, not just HTML forms. The distinction is structural vs semantic failure, not form vs JSON.
- ⚠ Saying '409 and 422 are interchangeable, just pick one' — This is the answer that causes duplicate transactions in production. They are not interchangeable. 422 means the data is wrong. 409 means the data is fine but the system state prevents it. A client should never retry a 422 with the same data. A client might legitimately resolve a 409 and retry.
- ⚠ Ignoring the response body and only talking about the status code number — Seniors know that the status code tells the client WHAT happened, but the response body (ideally following RFC 7807 Problem Details) tells the client WHY and WHAT TO DO. Mentioning only the number is a junior answer.
- ⚠ Saying '400 is for missing fields and 422 is for invalid values' — This is a common oversimplification. Both could apply to missing fields or invalid values. The real distinction is: can the server parse and understand the structure of the request at all (400), or did it understand it fully but reject it on semantic grounds (422)?

## Follow-Up Questions

1. What HTTP status code would you return if a user tries to access a resource they are authenticated for but not authorized to view — and how is that different from a completely unauthenticated request?
2. Have you heard of RFC 7807 Problem Details for HTTP APIs? How would you structure your error response bodies to make them machine-readable for API consumers?
3. If your API is idempotent on POST (using an idempotency key), what status code should you return when the same request is replayed — 200, 201, or 409 — and why?

## Senior Tip

> "The thing that separates a senior answer is connecting status codes to CLIENT BEHAVIOR. Do not just define the codes — explain what a well-behaved client should DO differently for each one. Mention retry logic, idempotency keys, and the fact that 4xx errors have different recovery strategies. If you can say 'I've seen a 400-for-everything API cause duplicate payments in production and here is why,' that is a senior answer. Juniors know the definitions. Seniors know the consequences."
