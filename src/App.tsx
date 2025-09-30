import React, { useEffect } from "react";
import Create from "./components/Questions/create";
import Read from "./components/Questions/read";
import { useQuestionStore } from "./store/questionStore";


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
| 1  | Name            | <input type="text" name="q1" /> |
| 2  | Phone           | <input type="text" name="q2" /> |
| 3  | Date of arrival | <input type="date" name="q3" /> |
| 4  | Nights          | <input type="number" name="q4" /> |
| 5  | Room type       | <radio name="q5" value="single" /> Single <br/> <radio name="q5" value="double" /> Double |


**Questions 1–5: Complete the form**
-------
## Section 2
A museum guide is talking about a tour.

**Questions 6–10: Choose the correct letter (A, B or C)**

6. The museum is open:  
<radio name="q6" value="A" /> A) Only weekdays  
<radio name="q6" value="B" /> B) Every day  
<radio name="q6" value="C" /> C) Weekends only  

...

---

## Section 3
Two students are discussing a project.

**Questions 11–13: Choose TWO letters**

<checkboxgroup name="q11_13" min="2" max="3">
- <checkbox value="A" /> Library research  
- <checkbox value="B" /> Interviewing staff  
- <checkbox value="C" /> Online survey  
- <checkbox value="D" /> Visiting companies  
</checkboxgroup>

---

## Section 4
A professor is giving a lecture about dolphins.

**Questions 31–33: Complete the notes**

- Dolphins communicate using <input type="text" name="q31" />  
- They usually live in <input type="text" name="q32" />  
- Their average lifespan is <input type="number" name="q33" /> years  

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


const markdown2 = `# PART 2 Questions 11 – 20

## Canadian Festival Theatre

### Questions 11 — 14
Choose the correct letter, A, B or C.  

11. What special offer is there for regular theatre-goers in this season?  
- A. They can see a second play at a reduced price.  
- B. They can buy two tickets and get two free.  
- C. They can get a discount on Mondays.  

12. What information is given about the study guides?  
- A. They are handed out at the theatre.  
- B. They provide information on the actors.  
- C. They give ideas for discussion.  

13. What information is given about the 'Bring a friend' special?  
- A. It is only for those over 65.  
- B. It applies to a number of productions.  
- C. It includes a 5% reduction on gifts.  

14. What does Michael say about the actor Christopher Plunket?  
- A. He may retire from acting soon.  
- B. He writes his own plays.  
- C. He prefers acting in films to performing live.  

---

### Main theme (A–H)
- A: living in a different century  
- B: managing to achieve success  
- C: ageing slowly  
- D: growing up  
- E: experiencing disappointment  
- F: living in a magical place  
- G: overcoming poverty  
- H: handling conflict  

### Questions 15 — 20
What is the main theme of each of the following musicals?  
Choose SIX answers from the box and write the correct letter, A-H.  

15. The Climb …………..  
16. The Voyagers …………..  
17. Joey Brown …………..  
18. Main Street …………..  
19. Millie and Mike …………..  
20. Windswept …………..`
function convertToMarkdown(text: string) {
  let result = text;
  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  result = result.replace(
    /(\d+)\.\s([^\n]+?)\n((?:- [A-Z]\..+\n?)+)/gs,
    (match, qNum, question, optionsBlock) => {
      // variantlarni olish
      const options = optionsBlock.trim().split("\n");

      // har bir variantni map qilish
      const radios = options.map((line: any, idx: number) => {
        const text = line.replace(/- [A-Z]\.\s*/, "").trim();
        const letter = alphabet[idx]; // A, B, C, D ...
        return `<radio name="q${qNum}" value="${letter}" /> ${letter}) ${text}`;
      });

      return `${qNum}. ${question.trim()}\n${radios.join("\n")}`;
    }
  )
  // 2) Harfli tanlash (A–H) variantli savollar jadvalga kiritish
  result = result.replace(
    /(\d+)\.\s([^\n]+)\.{2,}/g,
    (match, qNum, title) => {
      return `| ${qNum} | ${title.trim()} | <input type="text" name="q${qNum}" /> |`;
    }
  );

  return result;
}



const App: React.FC = () => {
  const { questions, fetchQuestions, loading, error } = useQuestionStore();

  useEffect(() => {
    // fetchQuestions();
    console.log(fixMarkdown(markdown));

  }, []);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p className="text-red-500">{error}</p>;
  return (
    <div className="w-full min-h-screen  bg-red-500">
      <Read markdown={convertToMarkdown(markdown2)} />
    </div>
  );
};

export default App;
