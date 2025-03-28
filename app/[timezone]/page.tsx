import { notFound } from "next/navigation";
import { CacheStateWatcher } from "../cache-state-watcher";
import { Suspense } from "react";
import { RevalidateFrom } from "../revalidate-from";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

type TimeData = {
  unixtime: number;
  datetime: string;
  timezone: string;
};

const timeZones = ["CET", "GMT"];

export const revalidate = 500;

async function getTimeData(timezone: string): Promise<TimeData> {
  const now = new Date();
  
  return {
    unixtime: Math.floor(now.getTime() / 1000),
    datetime: formatInTimeZone(now, timezone, "yyyy-MM-dd HH:mm:ss z"),
    timezone: timezone.toUpperCase()
  };
}

export async function generateStaticParams() {
  return timeZones.map((timezone) => ({ timezone }));
}

export default async function Page({ params: { timezone } }) {
  // Get tzdata from timezone name
  const timeData: TimeData = await getTimeData(timezone);

  return (
    <>
      <header className="header">
        {timeZones.map((timeZone) => (
          <Link key={timeZone} className="link" href={`/${timeZone}`}>
            {timeZone.toUpperCase()} Time
          </Link>
        ))}
      </header>
      <main className="widget">
        <div className="pre-rendered-at">
          {timeData.timezone} Time {timeData.datetime}
        </div>
        <Suspense fallback={null}>
          <CacheStateWatcher
            revalidateAfter={revalidate * 1000}
            time={timeData.unixtime * 1000}
          />
        </Suspense>
        <RevalidateFrom />
      </main>
      <footer className="footer">
        <Link
          href={process.env.NEXT_PUBLIC_REDIS_INSIGHT_URL}
          className="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          View RedisInsight &#x21AA;
        </Link>
      </footer>
    </>
  );
}
