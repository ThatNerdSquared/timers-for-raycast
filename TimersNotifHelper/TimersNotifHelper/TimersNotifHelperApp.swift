//
//  TimerNotifHelperApp.swift
//  TimerNotifHelper
//
//  Created by Nathan Yeung on 2024-05-16.
//

import UserNotifications

func scheduleNotif(timerName: String) async -> Void {
    // obtain notification permissions
    let notifCenter = UNUserNotificationCenter.current()
    let notifDelegate = TimerNotifDelegate();
    notifCenter.delegate = notifDelegate;
    do {
        try await notifCenter.requestAuthorization(options: [.alert])
    } catch {
        print("Could not obtain notification permission!")
        exit(1);
    }
    
    // set up actions
    let dismissTimerAction = UNNotificationAction(
        identifier: "dismissTimerAction",
        title: "Dismiss Timer"
    )
    let category = UNNotificationCategory(
        identifier: "timerNotif",
        actions: [dismissTimerAction],
        intentIdentifiers: []
    )
    notifCenter.setNotificationCategories([category])

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


class TimerNotifDelegate: NSObject, UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        print("SDJFLSDJFJDDSHJHFH")
        // pull out the buried userInfo dictionary
        let userInfo = response.notification.request.content.userInfo

        if let customData = userInfo["customData"] as? String {
            print("Custom data received: \(customData)")

            switch response.actionIdentifier {

            case "dismissTimerAction":
                // the user tapped our "show more info…" button
                print("Show more information…")

            default:
                break
            }
        }

        // you must call the completion handler when you're done
        completionHandler()
    }
}
