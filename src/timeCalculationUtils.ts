const getTimeAfterSeconds = (seconds: number): Date => {
  const now = new Date();
  const milliseconds = seconds * 1000;
  return new Date(now.getTime() + milliseconds);
}

export { getTimeAfterSeconds };