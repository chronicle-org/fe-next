
import { redirect } from "next/navigation";
import PostLayout from "./PostLayout";

const Post = async ({ params }: { params: Promise<{ id: string }> }) => {

  const param = await params;

  if (isNaN(parseInt(param.id))) redirect("/dashboard")

  return <PostLayout id={Number(param.id)} />
};

export default Post;
