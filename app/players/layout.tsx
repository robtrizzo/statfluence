import PlayerSearch from "../(components)/player-search";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mx-4">
        <PlayerSearch />
      </div>
      {children}
    </>
  );
}
