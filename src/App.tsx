import React, { createContext, useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useDropzone } from "react-dropzone";
import remarkGfm from "remark-gfm";

const markdown = [`
## Section 1
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

---

`,]
interface CheckboxGroupContextType {
  selected: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(
  null
);

function useCheckboxLimit(name: string, min: number, max: number) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSelected = [...selected];

    if (e.target.checked) {
      if (newSelected.length < max) {
        newSelected.push(e.target.value);
      } else {
        e.target.checked = false; // limitdan oshmasin
      }
    } else {
      newSelected = newSelected.filter((v) => v !== e.target.value);
    }

    setSelected(newSelected);
  };

  return { selected, handleChange };
}

// =======================
// CheckboxGroup Component
// =======================
interface CheckboxGroupProps {
  name: string;
  min?: number;
  max?: number;
  children: React.ReactNode;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  name,
  min = 0,
  max = 2,
  children,
}) => {
  const { selected, handleChange } = useCheckboxLimit(name, min, max);

  return (
    <CheckboxGroupContext.Provider value={{ selected, handleChange }}>
      <div>{children}</div>
    </CheckboxGroupContext.Provider>
  );
};

// =======================
// Checkbox Component
// =======================
interface CheckboxProps {
  name: string;
  value: string;
  children: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, value, children }) => {
  const ctx = useContext(CheckboxGroupContext);

  if (!ctx) {
    throw new Error("Checkbox must be used inside a CheckboxGroup");
  }

  const { handleChange } = ctx;

  return (
    <label className="block cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        onChange={handleChange}
        className="mr-2"
      />
      {children}
    </label>
  );
}
// Radio Props
interface RadioProps {
  name: string;
  value: string;
  children?: React.ReactNode;
}

const Radio: React.FC<RadioProps> = ({ name, value, children }) => {
  return (
    <label className="block cursor-pointer">
      <input type="radio" name={name} value={value} className="mr-2" />
      {children}
    </label>
  );
};

// Dropzone Props
interface DropzoneProps {
  name: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ name }) => {
  const onDrop = (files: File[]) => console.log("Uploaded:", files);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="p-4 border-2 border-dashed rounded">
      <input {...getInputProps()} name={name} />
      Fayllarni shu yerga tashlang yoki tanlang
    </div>
  );
};

export default function App() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    console.log(Object.fromEntries(data.entries()));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <ReactMarkdown
        rehypePlugins={[remarkGfm, rehypeRaw]}
        components={{
          radio: ({ node, ...props }) => <Radio name={""} value={""} {...props} />,
          checkbox: ({ node, ...props }) => <Checkbox name={""} value={""} children={undefined} {...props} />,
          checkboxgroup: ({ node, ...props }) => <CheckboxGroup name={""} children={undefined} {...props} />,
          input: ({ node, ...props }) => <input {...props} className="border p-1" />

        }}
      >
        {markdown[0]}
      </ReactMarkdown>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Yuborish
      </button>
    </form>
  );
}
