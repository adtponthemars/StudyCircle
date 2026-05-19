import React from "react";

const Categories = () => {
  const topics = [
  "Machine Learning",
  "Deep Learning",
  "Artificial Intelligence",
  "Neural Networks",
  "Natural Language Processing",
  "Computer Vision",
  "Data Science",
  "Reinforcement Learning",
  "Supervised Learning",
  "Unsupervised Learning"
];

  return (
    <section className="px-6 py-12 ">
      {/* Heading */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-3xl md:text-4xl font-semibold mb-5 tracking-tight text-gray-800"
          style={{ color: "var(--foreground)" }}
        >
          Suggested Topics
        </h2>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-3">
        {topics.map((item, index) => (
          <button
            key={index}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-md"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Categories;