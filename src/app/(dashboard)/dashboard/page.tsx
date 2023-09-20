import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const page = async ({}) => {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);
  console.log("friends", friends);

  // const friendsWithLastMessage = await Promise.all(

  //   friends.map(async (friend) => {
  //     try {

  //     } catch (error) {

  //     }
  //     const [lastMessageRaw] = (await fetchRedis(
  //       "zrange",
  //       `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
  //       -1,
  //       -1
  //     )) as string[];
  //     console.log("last message raw", lastMessageRaw);

  //     const lastMessage = JSON.parse(lastMessageRaw) as Message;
  //     console.log("last message", lastMessage);

  //     return {
  //       ...friend,
  //       lastMessage,
  //     };
  //   })
  // );

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      try {
        // const lastMessageRaw = await fetchRedis(
        //   "zrange",
        //   `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        //   -1,
        //   -1
        // );
        const lastMessageRawArray = await fetchRedis(
          "zrange",
          `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
          -1,
          -1
        );

        // Check if lastMessageRawArray is an array and has at least one element
        if (
          Array.isArray(lastMessageRawArray) &&
          lastMessageRawArray.length > 0
        ) {
          const lastMessageRaw = lastMessageRawArray[0]; // Get the first element

          // Parse the JSON from the first element
          const lastMessage = JSON.parse(lastMessageRaw) as Message;

          return {
            ...friend,
            lastMessage,
          };

          // console.log("lastMessageRaw:", lastMessageRaw);

          // if (typeof lastMessageRaw !== "undefined") {

          //   // Data is available, so parse it as JSON
          //   const lastMessage = JSON.parse(lastMessageRaw) as Message;
          //   console.log("last message", lastMessage);

          //   return {
          //     ...friend,
          //     lastMessage,
          //   };
        } else {
          // Data is undefined, handle this case (e.g., provide a default value)
          console.log("No last message available for", friend);
          return {
            ...friend,
            lastMessage: null, // You can provide a default value or handle it as needed
          };
        }
      } catch (error) {
        console.error("Error processing friend:", error);
        // Handle the error or return a default value as needed
        return {
          ...friend,
          lastMessage: null, // Provide a default value or handle it as needed
        };
      }
    })
  );

  return (
    <div className="container py-2">
      <h1 className="font-bold text-2xl sm:text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500"> nothing to show here</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${friend.name} profile picture`}
                    src={friend.image}
                    fill
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {friend.lastMessage &&
                    friend.lastMessage.senderId === session.user.id
                      ? "You:"
                      : ""}
                  </span>
                  {friend.lastMessage && friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default page;
