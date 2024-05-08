import UserNotifications

func scheduleNotif() async -> Void {
    let notifCenter = UNUserNotificationCenter.current()
    do {
        try await notifCenter.requestAuthorization(options: [.alert])
    } catch {
        print("Could not obtain notification permission!")
        return
    }
    let content = UNMutableNotificationContent()
    content.title = "Ding!"
    let trigger = UNTimeIntervalNotificationTrigger(
        timeInterval: 5,
        repeats: false
    )

    let request = UNNotificationRequest(
        identifier: UUID().uuidString,
        content: content,
        trigger: trigger
    )
    do {
        try await notifCenter.add(request)
    } catch {
        print("Could not add notification to notifCenter!")
    }
}

@main
struct TimerNotifHelper {
  static func main() async {
      await scheduleNotif()
  }
}
