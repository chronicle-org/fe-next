"use client";

import PostCard from "@/components/ui/PostCard";
import { getAllPosts } from "@/lib/api/post";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/ui/SearchBar";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const [search, setSearch] = useState("");
  const { push } = useRouter();

  const { data: posts, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await getAllPosts();
      return res.data.content;
    },
  });

  const filteredPosts = posts?.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-20 max-lg:px-10 flex flex-col gap-10 lg:pt-10 pb-10">
      <Heading />
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <p className="text-lg text-muted-foreground font-semibold">
            What are they writing here...
          </p>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {isFetching ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPosts?.map((item) => (
              <PostCard
                data={item}
                key={item.id}
                onClick={() => push(`/post/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Heading = () => {
  return (
    <div className="flex max-lg:flex-wrap max-lg:justify-center items-center gap-10 lg:mx-auto">
      <div className="shrink">
        <h1 className="text-4xl font-bold mt-10 mb-2">
          Share your stories, connect with minds
        </h1>
        <p className="text-lg text-muted-foreground">
          Share your stories with the world. Start writing and inspire others
          today!
        </p>
      </div>

      <Image
        src={"/landing-page-side-image.png"}
        alt="Chronicle Hero"
        width={500}
        height={300}
        className="rounded-md"
      />
    </div>
  )
}