"use client";
import { useState, ChangeEvent } from "react"; // ChangeEvent import করা হয়েছে
import { GoogleGenAI } from "@google/genai";
// Mock Button component for demonstration if not provided
interface ButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, className }) => (
  <button
    onClick={onClick}
    className={`w-full py-3 px-6 rounded-full font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${className}`}
  >
    {label}
  </button>
);

interface LoadingState {
  title: boolean;
  description: boolean;
  hashtags: boolean;
}

export default function Home() {
  const [inputValue, setInputValue] = useState<string>(""); // Explicitly string টাইপ করা হয়েছে
  const [contentSize, setContentSize] = useState<string>("LARGE"); // Explicitly string টাইপ করা হয়েছে

  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    // LoadingState ইন্টারফেস ব্যবহার করা হয়েছে
    title: false,
    description: false,
    hashtags: false,
  });

  // Output values
  const [title, setTitle] = useState<string>(""); // Explicitly string টাইপ করা হয়েছে
  const [description, setDescription] = useState<string>(""); // Explicitly string টাইপ করা হয়েছে
  const [hashtags, setHashtags] = useState<string>(""); // Explicitly string টাইপ করা হয়েছে

  // Mock AI or actual AI instance
  // const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY });
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const setUpAi: string = `
    You are a content creator specialist. You have to create contents for my users.
    When I ask you for title or description, keywords for hashtags, you have to follow these rules:

    1. The content should be SEO friendly.
    2. Don't generate any other text except requested output (title or description or hashtags).
    3. If it's a title, then make it like a title for YouTube or Facebook content or blog post and can be slightly question type. 
    4. If it's hashtags, then make it like hashtags for YouTube or Facebook content or blog post.
    5. Follow instructions given by the user.
    6. Don't make hastag in description
  `;

  const handleGenerateOutput = async () => {
    if (inputValue) {
      setTitle("");
      setDescription("");
      setHashtags("");
      setLoading({
        title: true,
        description: false,
        hashtags: false,
      });
      console.log("Generating ...");

      try {
        const resTitle = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `
            Your role : ${setUpAi}
            Now write a SEO friendly only one title for this content idea : ${inputValue}
          `,
        });
        setTitle(resTitle.text as string);
        console.log("Title:", resTitle.text);

        setLoading({
          title: false,
          description: true,
          hashtags: false,
        });

        const resDescription = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `
            Your role : ${setUpAi}
            Now write a SEO friendly only one description for this content title : ${resTitle.text}
            The length of description should be ${contentSize}
          `,
        });
        setDescription(resDescription.text as string);
        console.log("Description:", resDescription.text);

        setLoading({
          title: false,
          description: false,
          hashtags: true,
        });

        const resHashtags = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `
            Your role : ${setUpAi}
            Now write SEO friendly hashtags for this content: ${resDescription.text},
            and idea: ${inputValue}
            The length of hashtags should be 5-10
          `,
        });
        setHashtags(resHashtags.text as string);
        console.log("Hashtags:", resHashtags.text);
      } catch (error) {
        console.error("Error generating content:", error);
        // Handle error display to user if needed
      } finally {
        setLoading({
          title: false,
          description: false,
          hashtags: false,
        });
        setInputValue(""); // Clear input after generation attempt
      }
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    // text প্যারামিটারকে string টাইপ দেওয়া হয়েছে
    // Using document.execCommand('copy') as navigator.clipboard.writeText() might not work in iframes
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      console.log("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-900 font-inter">
      {/* Background overlay for subtle blur effect on the main content area */}
      <div className="absolute inset-0 z-0 backdrop-filter backdrop-blur-sm bg-white bg-opacity-30"></div>

      <div className="relative z-10 w-full max-w-2xl p-6 md:p-8 rounded-3xl shadow-2xl bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg border border-gray-200">
        <div className="  flex flex-col items-center mb-4 ">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center  text-gray-800">
            NOORIX
          </h1>
          <p className="text-xl font-medium mb-3 text-gray-700">
            Content Generator ✨
          </p>
        </div>

        <div className="mb-6">
          <p className="text-lg font-medium mb-3 text-gray-700">
            Enter your content idea:
          </p>
          <input
            type="text"
            value={inputValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            } // ChangeEvent টাইপ করা হয়েছে
            className="w-full p-3 bg-white bg-opacity-70 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
            placeholder="e.g., 'A blog post about sustainable living'"
          />
        </div>

        <div className="mb-8">
          <p className="text-lg font-medium mb-3 text-gray-700">
            Select content length:
          </p>
          <select
            name="contentSize"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setContentSize(e.target.value)
            } // ChangeEvent টাইপ করা হয়েছে
            value={contentSize}
            className="w-full p-3 bg-white bg-opacity-70 border border-gray-300 rounded-xl text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
          >
            <option className="bg-white text-gray-800" value="VERY LARGE">
              VERY LARGE
            </option>
            <option className="bg-white text-gray-800" value="LARGE">
              LARGE
            </option>
            <option className="bg-white text-gray-800" value="MEDIUM">
              MEDIUM
            </option>
            <option className="bg-white text-gray-800" value="SMALL">
              SMALL
            </option>
          </select>
        </div>

        <Button
          label={`${
            loading.title || loading.description || loading.hashtags
              ? "Generating..."
              : "Generate Content"
          }`}
          onClick={handleGenerateOutput}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
        />

        <div className="mt-8 text-sm text-gray-600 text-center">
          {/* Loading indicators */}
          {loading.title && (
            <p className="animate-pulse">✨ Generating Title...</p>
          )}
          {loading.description && (
            <>
              <p>✅ Title generated!</p>
              <p className="animate-pulse">📝 Generating Description...</p>
            </>
          )}
          {loading.hashtags && (
            <>
              <p>✅ Title generated!</p>
              <p>✅ Description generated!</p>
              <p className="animate-pulse">🏷️ Generating Hashtags...</p>
            </>
          )}
          {!loading.title &&
            !loading.description &&
            !loading.hashtags &&
            (title || description || hashtags) && (
              <p>🎉 All content generated!</p>
            )}
        </div>

        <div className="mt-8 space-y-6">
          {title && (
            <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-semibold text-gray-700">Title</p>
                <button
                  onClick={() => copyToClipboard(title)}
                  className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm py-1 px-3 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
          )}

          {description && (
            <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-semibold text-gray-700">
                  Description
                </p>
                <button
                  onClick={() => copyToClipboard(description)}
                  className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm py-1 px-3 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
              <p className="text-base text-gray-800 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {hashtags && (
            <div className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-md rounded-2xl p-5 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <p className="text-lg font-semibold text-gray-700">Hashtags</p>
                <button
                  onClick={() => copyToClipboard(hashtags)}
                  className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm py-1 px-3 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
              <p className="text-base text-gray-800 break-words">{hashtags}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
