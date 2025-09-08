// Default file templates for new rooms

export const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 500px;
    }
    h1 { color: #333; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 2rem; }
    button {
      background: #667eea; color: white; border: none;
      padding: 12px 24px; border-radius: 8px; cursor: pointer;
      font-size: 16px; transition: all 0.3s ease;
    }
    button:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .message { margin-top: 1.5rem; font-size: 1.2rem; color: #333; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to CodeCollabs!</h1>
    <p>Start editing this file to see changes in real-time.</p>
    <button id="greetBtn">Click me!</button>
    <div id="message" class="message"></div>
  </div>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const btn = document.getElementById("greetBtn");
      const msg = document.getElementById("message");
      if (btn) {
        btn.addEventListener("click", () => {
          msg.textContent = "👋 Hello from CodeCollabs!";
        });
      }
    });
  </script>
</body>
</html>`;

export const DEFAULT_JAVASCRIPT_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

console.log("Hello, CodeCollabs!");

// Try some JavaScript examples:
const greetUser = (name) => {
  return \`Welcome to CodeCollabs, \${name}!\`;
};

console.log(greetUser("Developer"));

// Math example
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Sum:", sum);`;

export const DEFAULT_PYTHON_TEMPLATE = `# Welcome to CodeCollabs!
# This is a collaborative code editor where you can write and run code together.

print("Hello, CodeCollabs!")

# Try some Python examples:
def greet_user(name):
    return f"Welcome to CodeCollabs, {name}!"

print(greet_user("Developer"))

# Math example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

# List operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
total = sum(numbers)

print("Original:", numbers)
print("Doubled:", doubled)
print("Sum:", total)

# Class example
class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b

calc = Calculator()
print("5 + 3 =", calc.add(5, 3))
print("4 * 7 =", calc.multiply(4, 7))`;

export const DEFAULT_CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

int main() {
    cout << "Hello, CodeCollabs!" << endl;
    
    // Variables and basic operations
    int a = 10, b = 20;
    cout << "Sum: " << (a + b) << endl;
    
    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};
    
    cout << "Original vector: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Transform vector
    for(int& num : numbers) {
        num *= 2;
    }
    
    cout << "Doubled vector: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    
    // Find maximum
    int max_val = *max_element(numbers.begin(), numbers.end());
    cout << "Maximum value: " << max_val << endl;
    
    return 0;
}`;

export const getDefaultTemplate = (language: string): string => {
  switch (language.toLowerCase()) {
    case 'html':
      return DEFAULT_HTML_TEMPLATE;
    case 'javascript':
    case 'js':
      return DEFAULT_JAVASCRIPT_TEMPLATE;
    case 'python':
    case 'py':
      return DEFAULT_PYTHON_TEMPLATE;
    case 'cpp':
    case 'c++':
      return DEFAULT_CPP_TEMPLATE;
    case 'typescript':
    case 'ts':
      return DEFAULT_JAVASCRIPT_TEMPLATE.replace(/\/\/ Welcome to CodeCollabs!/g, '// Welcome to CodeCollabs!\n// TypeScript example:');
    default:
      return `// Welcome to CodeCollabs!
// Start coding in ${language}...

console.log("Hello, CodeCollabs!");`;
  }
};