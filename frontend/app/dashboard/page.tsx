"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("githubData");

    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Welcome {data.user.login}
      </h1>

      <img
        src={data.user.avatar_url}
        alt="avatar"
        className="w-24 h-24 rounded-full mt-4"
      />

      <h2 className="text-2xl mt-10 mb-4">
        Repositories
      </h2>

      <div className="space-y-4">
        {data.repos.map((repo: any) => (
          <div
            key={repo.id}
            className="border p-4 rounded-xl"
          >
            <h3 className="font-semibold">
              {repo.name}
            </h3>

            <p className="text-sm text-gray-500">
              {repo.language}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}