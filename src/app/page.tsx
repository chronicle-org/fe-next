import PostCard from "@/components/ui/PostCard";
import { TPost } from "@/lib/api/post";
import Image from "next/image";

export default function Home() {
  return (
    <div className="px-20 max-lg:px-10 flex flex-col gap-10 lg:pt-10 pb-10">
      <Heading />
      <Content />
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

const dummyLandingPagePosts: Partial<TPost>[] = [
  {
    id: 1,
    user_id: 1,
    title: "Exploring the Depths of the Ocean: A Journey into the Unknown",
    sub_title: "Discovering the mysteries that lie beneath the waves",
    content:
      "The ocean, covering more than 70% of our planet, remains one of the least explored frontiers. From the vibrant coral reefs to the dark abyssal plains, each layer of the ocean holds secrets waiting to be uncovered. In this article, we embark on a journey to explore the depths of the ocean, shedding light on its diverse ecosystems and the incredible creatures that inhabit them.",
    thumbnail_url: "https://picsum.photos/200?random=1",
    comment_count: 12,
    created_at: "2023-10-01T10:00:00Z",
    updated_at: "2023-10-02T12:00:00Z",
    user: {
      id: 1,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      picture_url: "https://randomuser.me/api/portraits/thumb/women/1.jpg",
      created_at: "2022-05-15T09:30:00Z",
      handle: "janedoe"
    }
  },
  {
    id: 2,
    user_id: 2,
    title: "The Rise of Electric Vehicles: Driving Towards a Sustainable Future",
    sub_title: "How electric cars are transforming the automotive industry",
    content:
      "Electric vehicles (EVs) are no longer a niche market; they are rapidly becoming mainstream as technology advances and environmental concerns grow. This article explores the rise of electric vehicles, examining their benefits, challenges, and the impact they are having on the automotive industry and our planet.",
    thumbnail_url: "https://picsum.photos/200?random=1",
    comment_count: 8,
    created_at: "2024-11-05T14:30:00Z",
    updated_at: "2024-11-06T16:45:00Z",
    user: {
      id: 2,
      name: "John Smith",
      email: "john.smith@example.com",
      picture_url: "https://randomuser.me/api/portraits/thumb/men/1.jpg",
      created_at: "2022-06-10T11:00:00Z",
      handle: "johnsmith"
    },
  },
  {
    id: 3,
    user_id: 3,
    title: "Culinary Delights: A Journey Through World Cuisines",
    sub_title: "Exploring the flavors and traditions of global gastronomy",
    content:
      "Food is a universal language that connects people across cultures. In this article, we take a culinary journey around the world, exploring diverse cuisines, traditional recipes, and the stories behind some of the most beloved dishes. From spicy curries to delicate pastries, join us as we celebrate the art of cooking and the joy of eating.",
    thumbnail_url: "https://picsum.photos/200?random=1",
    comment_count: 15,
    created_at: "2025-02-12T09:15:00Z",
    updated_at: "2025-02-13T10:20:00Z",
    user: {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      picture_url: "https://randomuser.me/api/portraits/thumb/women/2.jpg",
      created_at: "2022-07-20T14:00:00Z",
      handle: "alicejohnson"
    }
  }
]

const Content = () => {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-lg text-muted-foreground font-semibold">
        What are they writing here...
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {
          dummyLandingPagePosts.map((item) => {
            const data = {
              ...item,
              title: `<h1>${item.title}</h1>`,
              // style="color: rgb(136, 136, 136);"
              sub_title: `<p><span style="color: rgb(136, 136, 136);">${item.sub_title}</span></p>`
            }
            return (
              <PostCard data={data} key={item.id} />
            )
          })
        }
      </div>
    </div>
  )
}