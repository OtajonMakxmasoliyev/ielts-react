import React, { useEffect } from "react";
import Create from "./components/Questions/create";
import Read from "./components/Questions/read";
import { useQuestionStore } from "./store/questionStore";
import { useState } from 'react';
interface Part {
  markdown: string;
  answers: string[];
  part_type: string;
}


const markdown = `## Section 1
You will hear a student booking a hotel room.

# IELTS Listening Practice Test

## Section 1
You will hear a student booking a hotel room.

**Questions 1–5: Complete the form**

## Section 1
You will hear a student booking a hotel room.

**Questions 1–5: Complete the form**

| Q# | Question        | Answer                           |
|----|-----------------|----------------------------------|
| 1  | Name            | <input type="text" name="1" /> |
| 2  | Phone           | <input type="text" name="2" /> |
| 3  | Date of arrival | <input type="date" name="3" /> |
| 4  | Nights          | <input type="number" name="4" /> |
| 5  | Room type       | <radio name="5" value="single" /> Single <br/> <radio name="5" value="double" /> Double |


**Questions 1–5: Complete the form**
-------
## Section 2
A museum guide is talking about a tour.

**Questions 6–10: Choose the correct letter (A, B or C)**

6. The museum is open:  
<radio name="6" value="A" /> A) Only weekdays  
<radio name="6" value="B" /> B) Every day  
<radio name="6" value="C" /> C) Weekends only  

...

---

## Section 3
Two students are discussing a project.

**Questions 11–13: Choose TWO letters**

<checkboxgroup name="11_13" min="2" max="3">
- <checkbox value="A" /> Library research  
- <checkbox value="B" /> Interviewing staff  
- <checkbox value="C" /> Online survey  
- <checkbox value="D" /> Visiting companies  
</checkboxgroup>

---

## Section 4
A professor is giving a lecture about dolphins.

**Questions 31–33: Complete the notes**

- Dolphins communicate using <input type="text" name="31" />  
- They usually live in <input type="text" name="32" />  
- Their average lifespan is <input type="number" name="33" /> years  

---`

function fixMarkdown(markdown: string) {
  return markdown
    // input
    .replace(/\[input([^\]]+)\]/g, '<input$1 />')

    // radio
    .replace(/<radio([^\]]+)\]/g, '<radio$1 />')

    // checkbox
    .replace(/\[checkbox([^\]]+)\]/g, '<checkbox$1 />')

    // checkboxgroup open
    .replace(/\[checkboxgroup([^\]]*)\]/g, '<checkboxgroup$1>')

    // checkboxgroup close
    .replace(/\[\/?checkboxgroup\]/g, '</checkboxgroup>')

    // <br] => <br/>
    .replace(/<br\]/g, '<br/>');
}


const markdown2 = `PART 2 Questions 11 – 20
Questions 11 — 14
Choose the correct letter, A, B or C.
Canadian Festival Theatre
11 What special offer is there for regular theatre-goers in this season?
A They can see a second play at a reduced price.
B They can buy two tickets and get two free.
C They can get a discount on Mondays.
12 What information is given about the study guides?
A They are handed out at the theatre.
B They provide information on the actors.
C They give ideas for discussion.`;

const markdown3 = `PART 1 Questions 1 – 10
Complete the table below.
Write ONE WORD AND/OR A NUMBER for each answer.
The London Relocation Services
Customer's name Anna Woods
• Current address | 118 1 …………… Park,Ballysillan
• Postcode. | BT149BJ`;

const markdown4 = `Questions 15 — 20
What is the main theme of each of the following musicals?
Choose SIX answers from the box and write the correct letter, A-H, next to questions 15-20.
Main theme
A living in a different century
B managing to achieve success
C ageing slowly
D growing up
E experiencing disappointment
Musicals
15 The Climb …………… ..
16 The Voyagers …………… ..`;

const markdown5 = `PART 3 Questions 21 – 30
Questions 21 — 26
Choose the correct letter A, B or C.
21 What part of Kathy's dissertation has the tutor just read?
A her results section
B her introductory chapter
C her review of the literature`;

function detectSectionType(section: string) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

  // 0. Table format: | belgisi bilan
  if (lines.some(line => line.includes('|'))) {
    return "table";
  }

  // 1. Checkbox
  const hasLetterColonFormat = lines.some(line => /^[A-H]\s+[a-z]/.test(line));
  if (hasLetterColonFormat) {
    return "checkbox";
  }

  // 2. Multiple choice
  const hasQuestionNumber = lines.some(line => /^\d+\s+/.test(line));
  const hasABCOptions = lines.filter(line => /^[A-C]\s+[A-Z]/.test(line)).length >= 2;

  if (hasQuestionNumber && hasABCOptions) {
    return "multipleChoice";
  }

  // 3. Fill answer
  const hasFillAnswer = lines.some(line => /^\d+\s+.+?[.…]{2,}/.test(line));
  if (hasFillAnswer) {
    return "fillAnswer";
  }

  // 4. Fill blank
  if (/[.…]{2,}/.test(section)) {
    return "fillBlank";
  }

  return "text";
}
function parseTableSection(section: string, partIndex: number) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  let result = '<table class="border-collapse w-full">';
  let inputCounter = 0;

  lines.forEach(line => {
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      result += '<tr>';

      parts.forEach(part => {
        if (/[.…]{2,}/.test(part)) {
          const replaced = part.replace(/[.…]{2,}/g,
            `<input type="text" class="border p-1 rounded w-32" name="part${partIndex}_q${inputCounter++}" />`
          );
          result += `<td class="p-2 border">${replaced}</td>`;
        } else {
          result += `<td class="p-2 border">${part}</td>`;
        }
      });

      result += '</tr>';
    }
  });

  result += '</table>';
  return result;
}
function parseTextInputSection(section: string, partIndex: number) {
  let counter = 0;
  return section.replace(/[.…]{2,}/g,
    () => `<input type="text" class="border p-1 rounded w-24" name="part${partIndex}_blank${counter++}" />`
  );
}
function parseMultipleChoiceSection(section: string, partIndex: number) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  let result = '';
  let currentQ = "";
  let currentQuestion = '';
  let options = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const qMatch = line.match(/^(\d+)\s+(.+)/);

    if (qMatch) {
      if (currentQ && options.length > 0) {
        result += `<li class="mb-4"><strong>${currentQ}. ${currentQuestion}</strong><br/>`;
        options.forEach(opt => {
          result += `<label class="block cursor-pointer ml-4">
            <input class="mr-2" type="radio" value="${opt.letter}" name="part${partIndex}_q${currentQ}">
            ${opt.letter}) ${opt.text}
          </label>`;
        });
        result += `</li>`;
      }

      currentQ = qMatch[1];
      currentQuestion = qMatch[2];
      options = [];
      continue;
    }

    const optMatch = line.match(/^([A-C])\s+(.+)/);
    if (optMatch && currentQ) {
      options.push({
        letter: optMatch[1],
        text: optMatch[2]
      });
    }
  }

  if (currentQ && options.length > 0) {
    result += `<li class="mb-4"><strong>${currentQ}. ${currentQuestion}</strong><br/>`;
    options.forEach(opt => {
      result += `<label class="block cursor-pointer ml-4">
        <input class="mr-2" type="radio" value="${opt.letter}" name="part${partIndex}_q${currentQ}">
        ${opt.letter}) ${opt.text}
      </label>`;
    });
    result += `</li>`;
  }

  return `<ul class="list-none">${result}</ul>`;
}
function parseCheckboxSection(section: string, partIndex: number) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  let checkboxes = '';
  let questions = '';

  lines.forEach(line => {
    const optMatch = line.match(/^([A-H])\s+(.+)/);
    if (optMatch) {
      const letter = optMatch[1];
      const text = optMatch[2];
      checkboxes += `<label class="block cursor-pointer">
        <input class="mr-2" type="checkbox" value="${letter}" name="part${partIndex}_options">
        ${letter}) ${text}
      </label>`;
    }

    const qMatch = line.match(/^(\d+)\s+(.+?)\s*[.…]{2,}/);
    if (qMatch) {
      questions += `<tr>
        <td class="pr-4 border p-2">${qMatch[1]}</td>
        <td class="pr-4 border p-2">${qMatch[2]}</td>
        <td class="border p-2"><input class="border p-1 rounded w-20" type="text" name="part${partIndex}_q${qMatch[1]}" /></td>
      </tr>`;
    }
  });

  return `<div class="mb-4"><strong>Options:</strong>${checkboxes}</div><table class="mt-4 w-full">${questions}</table>`;
}

function parseFillAnswerSection(section: string, partIndex: number) {
  const lines = section.split('\n');
  let result = '';

  lines.forEach(line => {
    const match = line.match(/^(\d+)\s+(.+?)\s*[.…]{2,}/);
    if (match) {
      result += `<tr>
        <td class="pr-4 border p-2">${match[1]}</td>
        <td class="pr-4 border p-2">${match[2].trim()}</td>
        <td class="border p-2"><input class="border p-1 rounded w-20" type="text" name="part${partIndex}_q${match[1]}" /></td>
      </tr>`;
    }
  });

  return `<table class="w-full">${result}</table>`;
}


function convertToMarkdown({ text, partIndex }: { text: string, partIndex: number }) {
  const type = detectSectionType(text);

  switch (type) {
    case "table":
      return parseTableSection(text, partIndex);
    case "multipleChoice":
      return parseMultipleChoiceSection(text, partIndex);
    case "checkbox":
      return parseCheckboxSection(text, partIndex);
    case "fillAnswer":
      return parseFillAnswerSection(text, partIndex);
    case "fillBlank":
      return parseTextInputSection(text, partIndex);
    default:
      return `<div>${parseTextInputSection(text, partIndex)}</div>`;
  }
}









const App: React.FC = () => {
  const { questions, fetchQuestions, loading, error } = useQuestionStore();
  const [result, setResult] = useState<any | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const markdowns = [markdown3, markdown2, markdown4, markdown5];



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const parts: Part[] = markdowns.map((markdown, index) => {
      const type = types[index];
      const answers: string[] = [];

      Array.from(formData.entries()).forEach(([name, value]) => {
        if (name.startsWith(`part${index}_`) && value) {
          answers.push(value as string);
        }
      });

      return {
        markdown,
        answers,
        part_type: type,
      };
    });

    const finalResult: any = {
      "title": "string",
      "slug": "string",
      "type": "multiple_choice",
      parts,
      "tags": [
        "string"
      ],
      "published": false,
      "attachments": [
        {
          "url": "string",
          "type": "string"
        }
      ]
    };
    setResult(finalResult);

    console.log("Submitting:", JSON.stringify(finalResult, null, 2));

    try {
      const response = await fetch("http://localhost:3000/questions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalResult),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Created successfully:", data);
      alert("Questions successfully created!");
    } catch (error) {
      console.error("❌ Error creating questions:", error);
      alert("Failed to create questions. Please try again.");
    }
  }

  return (
    <div className="w-full min-h-screen  bg-red-500">
      <form onSubmit={handleSubmit} className="space-y-4">

        {markdowns.map((item, index) => (
          <div>
            <Read
              key={index}
              markdown={convertToMarkdown({ text: item, partIndex: index })}
              index={index}
            />
            <select
              onChange={(e) =>
                setTypes((prev: any[]) => {
                  const updated = [...prev]; // massivni nusxalash
                  updated[index] = e.target.value; // o‘zgartirish
                  return updated; // yangi massivni qaytarish
                })
              }
            >
              <option value="education">Education and Learning</option>
              <option value="environment">Environment and Climate Change</option>
              <option value="technology">Technology and Communication</option>
            </select>
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Yuborish
        </button>
      </form >
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-bold mb-2">Natija:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>

  );
};

export default App;
