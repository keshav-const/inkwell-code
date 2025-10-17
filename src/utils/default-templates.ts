// // Default file templates for new rooms

// export const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>My Project</title>
//   <style>
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body {
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//       line-height: 1.6;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       min-height: 100vh;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     }
//     .container {
//       background: white;
//       padding: 2rem;
//       border-radius: 12px;
//       box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
//       text-align: center;
//       max-width: 500px;
//     }
//     h1 { color: #333; margin-bottom: 1rem; }
//     p { color: #666; margin-bottom: 2rem; }
//     button {
//       background: #667eea;
//       color: white;
//       border: none;
//       padding: 12px 24px;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 16px;
//       transition: all 0.3s ease;
//     }
//     button:hover {
//       background: #5a6fd8;
//       transform: translateY(-2px);
//       box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
//     }
//     .message {
//       margin-top: 1.5rem;
//       font-size: 1.2rem;
//       color: #333;
//       font-weight: bold;
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <h1>Welcome to CodeCollabs!</h1>
//     <p>Start editing this file to see changes in real-time.</p>
//     <button id="greetBtn">Click me!</button>
//     <div id="message" class="message"></div>
//   </div>
//   <script>
//     document.addEventListener("DOMContentLoaded", () => {
//       const btn = document.getElementById("greetBtn");
//       const msg = document.getElementById("message");
//       if (btn) {
//         btn.addEventListener("click", () => {
//           msg.textContent = "👋 Hello from CodeCollabs!";
//         });
//       }
//     });
//   </script>
// </body>
// </html>`;

// export const DEFAULT_JAVASCRIPT_TEMPLATE = `// Welcome to CodeCollabs!
// // This is a collaborative code editor where you can write and run code together.

// console.log("Hello, CodeCollabs!");

// // Try some JavaScript examples:
// const greetUser = (name) => {
//   return \`Welcome to CodeCollabs, \${name}!\`;
// };

// console.log(greetUser("Developer"));

// // Math example
// const fibonacci = (n) => {
//   if (n <= 1) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// };

// console.log("Fibonacci sequence:");
// for (let i = 0; i < 10; i++) {
//   console.log(\`F(\${i}) = \${fibonacci(i)}\`);
// }

// // Array operations
// const numbers = [1, 2, 3, 4, 5];
// const doubled = numbers.map(n => n * 2);
// const sum = numbers.reduce((acc, n) => acc + n, 0);

// console.log("Original:", numbers);
// console.log("Doubled:", doubled);
// console.log("Sum:", sum);`;

// export const DEFAULT_PYTHON_TEMPLATE = `# Welcome to CodeCollabs!
// # This is a collaborative code editor where you can write and run code together.

// print("Hello, CodeCollabs!")

// # Try some Python examples:
// def greet_user(name):
//     return f"Welcome to CodeCollabs, {name}!"

// print(greet_user("Developer"))

// # Math example
// def fibonacci(n):
//     if n <= 1:
//         return n
//     return fibonacci(n - 1) + fibonacci(n - 2)

// print("Fibonacci sequence:")
// for i in range(10):
//     print(f"F({i}) = {fibonacci(i)}")

// # List operations
// numbers = [1, 2, 3, 4, 5]
// doubled = [n * 2 for n in numbers]
// total = sum(numbers)

// print("Original:", numbers)
// print("Doubled:", doubled)
// print("Sum:", total)

// # Class example
// class Calculator:
//     def add(self, a, b):
//         return a + b
    
//     def multiply(self, a, b):
//         return a * b

// calc = Calculator()
// print("5 + 3 =", calc.add(5, 3))
// print("4 * 7 =", calc.multiply(4, 7))`;

// export const DEFAULT_CPP_TEMPLATE = `#include <iostream>
// #include <vector>
// #include <algorithm>

// using namespace std;

// // Welcome to CodeCollabs!
// // This is a collaborative code editor where you can write and run code together.

// int main() {
//     cout << "Hello, CodeCollabs!" << endl;
    
//     // Variables and basic operations
//     int a = 10, b = 20;
//     cout << "Sum: " << (a + b) << endl;
    
//     // Vector example
//     vector<int> numbers = {1, 2, 3, 4, 5};
    
//     cout << "Original vector: ";
//     for(int num : numbers) {
//         cout << num << " ";
//     }
//     cout << endl;
    
//     // Transform vector
//     for(int& num : numbers) {
//         num *= 2;
//     }
    
//     cout << "Doubled vector: ";
//     for(int num : numbers) {
//         cout << num << " ";
//     }
//     cout << endl;
    
//     // Find maximum
//     int max_val = *max_element(numbers.begin(), numbers.end());
//     cout << "Maximum value: " << max_val << endl;
    
//     return 0;
// }`;

// export const getDefaultTemplate = (language: string): string => {
//   switch (language.toLowerCase()) {
//     case 'html':
//       return DEFAULT_HTML_TEMPLATE;
//     case 'javascript':
//     case 'js':
//       return DEFAULT_JAVASCRIPT_TEMPLATE;
//     case 'python':
//     case 'py':
//       return DEFAULT_PYTHON_TEMPLATE;
//     case 'cpp':
//     case 'c++':
//       return DEFAULT_CPP_TEMPLATE;
//     case 'typescript':
//     case 'ts':
//       return DEFAULT_JAVASCRIPT_TEMPLATE.replace(/\/\/ Welcome to CodeCollabs!/g, '// Welcome to CodeCollabs!\n// TypeScript example:');
//     default:
//       return `// Welcome to CodeCollabs!
// // Start coding in ${language}...

// console.log("Hello, CodeCollabs!");`;
//   }
// };



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
      color: #333;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 500px;
    }
    h1 { margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 2rem; }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    button:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .message {
      margin-top: 1.5rem;
      font-size: 1.2rem;
      font-weight: bold;
    }
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

export const DEFAULT_JAVAScript_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

console.log("Hello, CodeCollabs!");

// Try some JavaScript examples:
const greetUser = (name) => {
  return \`Welcome to CodeCollabs, \${name}!\`;
};

console.log(greetUser("Developer"));

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

# List operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
total = sum(numbers)

print("Original:", numbers)
print("Doubled:", doubled)
print("Sum:", total)`;

export const DEFAULT_CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <numeric>

// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

int main() {
    std::cout << "Hello, CodeCollabs!" << std::endl;
    
    // Vector example
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    std::cout << "Original vector: ";
    for(int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    // Calculate sum
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum: " << sum << std::endl;
    
    return 0;
}`;

export const DEFAULT_JAVA_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeCollabs!");

        // Example method call
        String message = greetUser("Developer");
        System.out.println(message);

        // Array example
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : numbers) {
            sum += n;
        }
        System.out.println("Sum of array: " + sum);
    }

    public static String greetUser(String name) {
        return "Welcome to CodeCollabs, " + name + "!";
    }
}`;

export const DEFAULT_C_TEMPLATE = `#include <stdio.h>

// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

// Function prototype
void greet() {
    printf("This is a function call.\\n");
}

int main() {
    printf("Hello, CodeCollabs!\\n");

    // Variables and basic operations
    int a = 10;
    int b = 20;
    printf("Sum of %d and %d is %d\\n", a, b, a + b);

    greet();
    
    return 0;
}`;

export const DEFAULT_CSHARP_TEMPLATE = `using System;
using System.Linq;
using System.Collections.Generic;

// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("Hello, CodeCollabs!");
        
        // Method call
        Console.WriteLine(GreetUser("Developer"));
        
        // List operations with LINQ
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        var sum = numbers.Sum();

        Console.WriteLine("The sum is: " + sum);
    }

    public static string GreetUser(string name)
    {
        return $"Welcome to CodeCollabs, {name}!";
    }
}`;

export const DEFAULT_GO_TEMPLATE = `package main

import "fmt"

// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

func main() {
    fmt.Println("Hello, CodeCollabs!")

    // Function call
    message := greetUser("Developer")
    fmt.Println(message)

    // Slices (Go's version of dynamic arrays)
    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range numbers {
        sum += n
    }
    fmt.Printf("Sum of slice: %d\\n", sum)
}

func greetUser(name string) string {
    return fmt.Sprintf("Welcome to CodeCollabs, %s!", name)
}`;

export const DEFAULT_RUBY_TEMPLATE = `# Welcome to CodeCollabs!
# This is a collaborative code editor where you can write and run code together.

puts "Hello, CodeCollabs!"

# Method example
def greet_user(name)
  "Welcome to CodeCollabs, #{name}!"
end

puts greet_user("Developer")

# Array operations
numbers = [1, 2, 3, 4, 5]
sum = numbers.sum

puts "The sum of #{numbers} is #{sum}"`;

export const DEFAULT_RUST_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

fn main() {
    println!("Hello, CodeCollabs!");

    // Function call
    let message = greet_user("Developer");
    println!("{}", message);

    // Vector example
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("The sum of the vector is: {}", sum);
}

fn greet_user(name: &str) -> String {
    format!("Welcome to CodeCollabs, {}!", name)
}`;

export const DEFAULT_PHP_TEMPLATE = `<?php
// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

echo "Hello, CodeCollabs!\\n";

// Function example
function greet_user($name) {
    return "Welcome to CodeCollabs, " . $name . "!";
}

echo greet_user("Developer") . "\\n";

// Array example
$numbers = [1, 2, 3, 4, 5];
$sum = array_sum($numbers);

echo "The sum of the array is: " . $sum . "\\n";
?>`;

export const DEFAULT_SWIFT_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

import Foundation

print("Hello, CodeCollabs!")

// Function example
func greetUser(name: String) -> String {
    return "Welcome to CodeCollabs, \\(name)!"
}

print(greetUser(name: "Developer"))

// Array operations
let numbers = [1, 2, 3, 4, 5]
let sum = numbers.reduce(0, +)

print("The sum of the array is: \\(sum)")`;

export const DEFAULT_KOTLIN_TEMPLATE = `// Welcome to CodeCollabs!
// This is a collaborative code editor where you can write and run code together.

fun main() {
    println("Hello, CodeCollabs!")

    // Function call
    val message = greetUser("Developer")
    println(message)
    
    // List operations
    val numbers = listOf(1, 2, 3, 4, 5)
    val sum = numbers.sum()

    println("The sum of the list is: $sum")
}

fun greetUser(name: String): String {
    return "Welcome to CodeCollabs, $name!"
}`;

export const DEFAULT_JSON_TEMPLATE = `{
  "projectName": "CodeCollabs Sample",
  "version": "1.0.0",
  "description": "A default JSON file for your new project.",
  "collaborators": [
    {
      "id": 1,
      "username": "alex_dev"
    },
    {
      "id": 2,
      "username": "sam_designer"
    }
  ],
  "settings": {
    "theme": "dark",
    "autosave": true
  }
}`;

export const getDefaultTemplate = (language: string): string => {
  switch (language.toLowerCase()) {
    case 'html':
      return DEFAULT_HTML_TEMPLATE;
    case 'javascript':
    case 'js':
      return DEFAULT_JAVAScript_TEMPLATE;
    case 'typescript':
    case 'ts':
      return DEFAULT_JAVAScript_TEMPLATE.replace(/\/\/ Welcome/g, '// Welcome');
    case 'python':
    case 'py':
      return DEFAULT_PYTHON_TEMPLATE;
    case 'cpp':
    case 'c++':
      return DEFAULT_CPP_TEMPLATE;
    case 'java':
      return DEFAULT_JAVA_TEMPLATE;
    case 'c':
      return DEFAULT_C_TEMPLATE;
    case 'csharp':
    case 'cs':
      return DEFAULT_CSHARP_TEMPLATE;
    case 'go':
      return DEFAULT_GO_TEMPLATE;
    case 'ruby':
    case 'rb':
      return DEFAULT_RUBY_TEMPLATE;
    case 'rust':
    case 'rs':
      return DEFAULT_RUST_TEMPLATE;
    case 'php':
      return DEFAULT_PHP_TEMPLATE;
    case 'swift':
      return DEFAULT_SWIFT_TEMPLATE;
    case 'kotlin':
    case 'kt':
      return DEFAULT_KOTLIN_TEMPLATE;
    case 'json':
      return DEFAULT_JSON_TEMPLATE;
    default:
      return `// Welcome to CodeCollabs!
// Start coding in ${language}...`;
  }
};
