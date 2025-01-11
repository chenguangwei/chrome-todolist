import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param date 日期时间字符串或Date对象
 * @param format 格式化模式，默认为 'YYYY-MM-DD HH:mm'
 */
export const formatDate = (date: string | Date | number, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

/**
 * 获取相对时间描述
 * @param date 日期时间字符串或Date对象
 */
export const getRelativeTime = (date: string | Date | number): string => {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = target.diff(now, 'minute');
  
  if (diffMinutes < 0) {
    return '已过期';
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟后`;
  }
  
  const diffHours = target.diff(now, 'hour');
  if (diffHours < 24) {
    return `${diffHours}小时后`;
  }
  
  const diffDays = target.diff(now, 'day');
  if (diffDays < 30) {
    return `${diffDays}天后`;
  }
  
  return formatDate(date);
};

/**
 * 判断日期是否过期
 * @param date 日期时间字符串或Date对象
 */
export const isExpired = (date: string | Date | number): boolean => {
  return dayjs(date).isBefore(dayjs());
};

/**
 * 判断两个日期是否是同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 */
export const isSameDay = (date1: string | Date | number, date2: string | Date | number): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

/**
 * 获取日期的开始时间
 * @param date 日期时间字符串或Date对象
 */
export const getStartOfDay = (date: string | Date | number): Date => {
  return dayjs(date).startOf('day').toDate();
};

/**
 * 获取日期的结束时间
 * @param date 日期时间字符串或Date对象
 */
export const getEndOfDay = (date: string | Date | number): Date => {
  return dayjs(date).endOf('day').toDate();
}; 