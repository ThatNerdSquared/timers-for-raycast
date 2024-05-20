import UserNotifications

func scheduleNotif(timerName: String) async -> Void {
    // obtain notification permissions
    let notifCenter = UNUserNotificationCenter.current()
    do {
        try await notifCenter.requestAuthorization(options: [.alert])
    } catch {
        print("Could not obtain notification permission!")
        exit(1);
    }
    
    let content = UNMutableNotificationContent()
    content.title = "Ding!"
    content.subtitle = "Timer \"\(timerName)\" complete."
    content.categoryIdentifier = "timerNotif"
    let trigger = UNTimeIntervalNotificationTrigger(
        timeInterval: 1,
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
        exit(1);
    }
}

@main
struct TimerNotifHelper {
    static func main() async {
        let timerName = CommandLine.arguments[1];
        await scheduleNotif(timerName: timerName)
    }
}
